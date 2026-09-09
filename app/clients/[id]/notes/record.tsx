import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useVoiceRecorder } from "@/features/fieldNotes/useVoiceRecorder";
import { colors, radius, spacing, typography } from "@/theme";

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export default function RecordVoiceNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isRecording, elapsedSeconds, start, stop, cancel } =
    useVoiceRecorder();
  const [starting, setStarting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    setStarting(true);
    try {
      await start();
    } catch {
      setError(
        "No se pudo acceder al micrófono. Revisa el permiso en Ajustes."
      );
    } finally {
      setStarting(false);
    }
  };

  const handleStop = async () => {
    setSaving(true);
    try {
      const result = await stop();
      if (!result.fileUri) {
        setError("La grabación no se pudo guardar. Intenta de nuevo.");
        return;
      }
      router.replace({
        pathname: `/clients/${id}/notes/save` as never,
        params: {
          type: "voz",
          fileUri: result.fileUri,
          durationSeconds: String(result.durationSeconds),
        },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.center}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.timer}>{formatElapsed(elapsedSeconds)}</Text>

        <Pressable
          style={[styles.recordButton, isRecording && styles.recordButtonActive]}
          onPress={isRecording ? handleStop : handleStart}
          disabled={starting || saving}
        >
          <Text style={styles.recordLabel}>
            {isRecording ? "Detener" : starting ? "Preparando…" : "Grabar"}
          </Text>
        </Pressable>

        {isRecording ? (
          <Pressable
            onPress={() => {
              cancel();
              router.back();
            }}
          >
            <Text style={styles.cancel}>Cancelar</Text>
          </Pressable>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  timer: {
    fontFamily: typography.headingBold,
    fontSize: 40,
    color: colors.ink,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.terracotta,
    alignItems: "center",
    justifyContent: "center",
  },
  recordButtonActive: {
    backgroundColor: "#9A3B34",
    borderRadius: radius.lg,
  },
  recordLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.background,
    textAlign: "center",
  },
  cancel: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.muted,
  },
  error: {
    fontFamily: typography.body,
    fontSize: 14,
    color: "#9A3B34",
    textAlign: "center",
    paddingHorizontal: spacing.lg,
  },
});
