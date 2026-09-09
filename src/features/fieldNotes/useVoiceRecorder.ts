import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

import { newId } from "@/db/uuid";

// Grabación de notas de voz con expo-av. Sin transcripción automática —
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
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

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
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      throw new Error("Permiso de micrófono denegado");
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recordingRef.current = recording;
    setIsRecording(true);
    startTimer();
  }, [startTimer]);

  const stop = useCallback(async (): Promise<VoiceRecordingResult> => {
    setIsRecording(false);
    stopTimer();

    const recording = recordingRef.current;
    recordingRef.current = null;
    const durationSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    );
    if (!recording) {
      return { fileUri: null, durationSeconds };
    }

    await recording.stopAndUnloadAsync();
    const sourceUri = recording.getURI();
    if (!sourceUri) {
      return { fileUri: null, durationSeconds };
    }

    const destUri = `${RECORDINGS_DIR}${newId()}.m4a`;
    await FileSystem.moveAsync({ from: sourceUri, to: destUri });
    return { fileUri: destUri, durationSeconds };
  }, [stopTimer]);

  const cancel = useCallback(() => {
    setIsRecording(false);
    stopTimer();
    recordingRef.current?.stopAndUnloadAsync().catch(() => {});
    recordingRef.current = null;
  }, [stopTimer]);

  return { isRecording, elapsedSeconds, start, stop, cancel };
}
