import { useCallback, useRef, useState } from "react";
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

import { newId } from "@/db/uuid";

// Grabación de notas de voz con expo-audio. Sin transcripción automática —
// se guarda el audio y se reproduce desde la ficha de la nota; la
// descripción se escribe a mano.

const RECORDINGS_DIR = `${FileSystem.documentDirectory}field-notes/`;

async function ensureRecordingsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(RECORDINGS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

export type VoiceRecordingResult = {
  fileUri: string | null;
  durationSeconds: number;
};

export function useVoiceRecorder() {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startedAtRef.current) / 1000));
    }, 500);
  }, []);

  const start = useCallback(async () => {
    await ensureRecordingsDir();
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) {
      throw new Error("Permiso de micrófono denegado");
    }
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    startTimer();
  }, [recorder, startTimer]);

  const stop = useCallback(async (): Promise<VoiceRecordingResult> => {
    setIsRecording(false);
    stopTimer();

    const durationSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    );

    await recorder.stop();
    const sourceUri = recorder.uri;
    if (!sourceUri) {
      return { fileUri: null, durationSeconds };
    }

    const extension = sourceUri.split(".").pop() || "m4a";
    const destUri = `${RECORDINGS_DIR}${newId()}.${extension}`;
    await FileSystem.moveAsync({ from: sourceUri, to: destUri });
    return { fileUri: destUri, durationSeconds };
  }, [recorder, stopTimer]);

  const cancel = useCallback(() => {
    setIsRecording(false);
    stopTimer();
    recorder.stop().catch(() => {});
  }, [recorder, stopTimer]);

  return { isRecording, elapsedSeconds, start, stop, cancel };
}
