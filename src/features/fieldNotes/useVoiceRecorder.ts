import { useCallback, useRef, useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import {
  ExpoSpeechRecognitionModule,
  isRecognitionAvailable,
  supportsOnDeviceRecognition,
  supportsRecording,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

import { newId } from "@/db/uuid";

// Grabación de notas de voz con dos posibles motores, decidido al
// arrancar cada grabación:
//
//   1. "speech-recognition" (preferido): usa expo-speech-recognition en
//      modo on-device — graba el audio Y transcribe al mismo tiempo. Solo
//      se usa si el dispositivo reporta soporte para reconocimiento y
//      grabación offline (`isRecognitionAvailable` +
//      `supportsOnDeviceRecognition` + `supportsRecording`) y el permiso
//      es concedido.
//   2. "plain-audio" (respaldo): graba con expo-av, sin transcripción.
//      Se usa siempre que el motor 1 no esté disponible — así grabar
//      NUNCA depende de que el reconocimiento de voz funcione.
//
// Grabar debe funcionar siempre que haya permiso de micrófono; transcribir
// es "mejor esfuerzo" encima de eso.

const RECORDINGS_DIR = `${FileSystem.documentDirectory}field-notes/`;
// Español genérico, reconocido tanto por iOS como por Android. Si la
// mayoría de clientes de la usuaria está en un país específico, cambiar
// aquí (ej. "es-CO", "es-AR") puede mejorar la precisión.
const LOCALE = "es-MX";
const STOP_TIMEOUT_MS = 6000;

async function ensureRecordingsDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(RECORDINGS_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
  }
}

export type VoiceRecordingResult = {
  fileUri: string | null;
  durationSeconds: number;
  transcript: string | null;
  transcriptStatus: "done" | "unavailable" | "error";
};

type Backend = "speech-recognition" | "plain-audio" | null;

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState("");

  const backendRef = useRef<Backend>(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTranscriptRef = useRef("");
  const finalTranscriptRef = useRef("");
  const audioUriRef = useRef<string | null>(null);
  const avRecordingRef = useRef<Audio.Recording | null>(null);
  const endedRef = useRef(false);
  const audioEndedRef = useRef(false);
  const stopResolveRef = useRef<((r: VoiceRecordingResult) => void) | null>(
    null
  );

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

  const maybeResolveStop = useCallback(() => {
    if (!stopResolveRef.current) return;
    if (!endedRef.current || !audioEndedRef.current) return;
    const resolve = stopResolveRef.current;
    stopResolveRef.current = null;
    stopTimer();

    const fileUri = audioUriRef.current;
    const durationSeconds = Math.round(
      (Date.now() - startedAtRef.current) / 1000
    );
    const transcript = finalTranscriptRef.current || lastTranscriptRef.current;

    resolve({
      fileUri,
      durationSeconds,
      transcript: transcript || null,
      transcriptStatus: !fileUri ? "error" : transcript ? "done" : "unavailable",
    });
  }, [stopTimer]);

  useSpeechRecognitionEvent("result", (event) => {
    const transcript = event.results[0]?.transcript ?? "";
    lastTranscriptRef.current = transcript;
    if (event.isFinal) finalTranscriptRef.current = transcript;
    setLiveTranscript(transcript);
  });

  useSpeechRecognitionEvent("audioend", (event) => {
    audioUriRef.current = event.uri;
    audioEndedRef.current = true;
    maybeResolveStop();
  });

  useSpeechRecognitionEvent("end", () => {
    endedRef.current = true;
    maybeResolveStop();
  });

  useSpeechRecognitionEvent("error", () => {
    if (backendRef.current !== "speech-recognition") return;
    // Si el error llega antes de que se persista el audio, no hay nada
    // que rescatar de esta sesión — se resuelve igual para no dejar la
    // UI colgada, y el resultado quedará marcado como error.
    endedRef.current = true;
    if (!audioEndedRef.current && !audioUriRef.current) {
      audioEndedRef.current = true;
    }
    maybeResolveStop();
  });

  const start = useCallback(async () => {
    await ensureRecordingsDir();
    lastTranscriptRef.current = "";
    finalTranscriptRef.current = "";
    audioUriRef.current = null;
    endedRef.current = false;
    audioEndedRef.current = false;
    setLiveTranscript("");

    const canUseRecognition =
      isRecognitionAvailable() &&
      supportsOnDeviceRecognition() &&
      supportsRecording();

    if (canUseRecognition) {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (permission.granted) {
        backendRef.current = "speech-recognition";
        ExpoSpeechRecognitionModule.start({
          lang: LOCALE,
          interimResults: true,
          continuous: true,
          requiresOnDeviceRecognition: true,
          recordingOptions: {
            persist: true,
            outputDirectory: RECORDINGS_DIR,
            outputFileName: `${newId()}.wav`,
          },
        });
        setIsRecording(true);
        startTimer();
        return;
      }
    }

    // Respaldo: grabación simple, sin transcripción.
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
    avRecordingRef.current = recording;
    backendRef.current = "plain-audio";
    setIsRecording(true);
    startTimer();
  }, [startTimer]);

  const stop = useCallback((): Promise<VoiceRecordingResult> => {
    setIsRecording(false);

    if (backendRef.current === "plain-audio") {
      return (async () => {
        stopTimer();
        const recording = avRecordingRef.current;
        avRecordingRef.current = null;
        const durationSeconds = Math.round(
          (Date.now() - startedAtRef.current) / 1000
        );
        if (!recording) {
          return {
            fileUri: null,
            durationSeconds,
            transcript: null,
            transcriptStatus: "error" as const,
          };
        }
        await recording.stopAndUnloadAsync();
        const sourceUri = recording.getURI();
        if (!sourceUri) {
          return {
            fileUri: null,
            durationSeconds,
            transcript: null,
            transcriptStatus: "error" as const,
          };
        }
        const destUri = `${RECORDINGS_DIR}${newId()}.m4a`;
        await FileSystem.moveAsync({ from: sourceUri, to: destUri });
        return {
          fileUri: destUri,
          durationSeconds,
          transcript: null,
          transcriptStatus: "unavailable" as const,
        };
      })();
    }

    // Motor de reconocimiento de voz: stop() es "fire and forget" del
    // lado nativo — el resultado llega por los eventos "end"/"audioend".
    return new Promise((resolve) => {
      stopResolveRef.current = resolve;
      ExpoSpeechRecognitionModule.stop();
      setTimeout(() => {
        if (stopResolveRef.current !== resolve) return;
        endedRef.current = true;
        audioEndedRef.current = true;
        maybeResolveStop();
      }, STOP_TIMEOUT_MS);
    });
  }, [maybeResolveStop, stopTimer]);

  const cancel = useCallback(() => {
    setIsRecording(false);
    stopTimer();
    stopResolveRef.current = null;
    if (backendRef.current === "plain-audio") {
      avRecordingRef.current?.stopAndUnloadAsync().catch(() => {});
      avRecordingRef.current = null;
    } else if (backendRef.current === "speech-recognition") {
      ExpoSpeechRecognitionModule.abort();
    }
    backendRef.current = null;
  }, [stopTimer]);

  return { isRecording, elapsedSeconds, liveTranscript, start, stop, cancel };
}
