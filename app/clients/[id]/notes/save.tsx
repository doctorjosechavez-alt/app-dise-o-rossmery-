import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";
import { ResizeMode, Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { AreaPicker } from "@/features/areas/AreaPicker";
import { createFieldNote } from "@/features/fieldNotes/fieldNotes.repository";
import type { FieldNoteType, TranscriptStatus } from "@/features/fieldNotes/types";
import { deleteMediaFile } from "@/services/fileStorage";
import { colors, radius, spacing, typography } from "@/theme";

const TITLES: Record<FieldNoteType, string> = {
  foto: "Guardar foto",
  video: "Guardar video",
  voz: "Guardar nota de voz",
  texto: "Nueva nota de texto",
};

export default function SaveFieldNoteScreen() {
  const params = useLocalSearchParams<{
    id: string;
    type: FieldNoteType;
    fileUri?: string;
    durationSeconds?: string;
    transcript?: string;
    transcriptStatus?: TranscriptStatus;
  }>();
  const router = useRouter();
  const { id, type, fileUri } = params;

  const [areaId, setAreaId] = useState<string | null>(null);
  const [description, setDescription] = useState(params.transcript ?? "");
  const [saving, setSaving] = useState(false);

  const isTextNote = type === "texto";
  const canSave = saving === false && (!isTextNote || description.trim().length > 0);

  const handleSave = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await createFieldNote(id, {
        areaId,
        type,
        fileUri: fileUri ?? null,
        durationSeconds: params.durationSeconds
          ? Number(params.durationSeconds)
          : null,
        description: description.trim() || null,
        transcript: params.transcript?.trim() || null,
        transcriptStatus: params.transcriptStatus ?? "not_applicable",
        recordedAt: new Date().toISOString(),
      });
      router.dismissAll();
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = async () => {
    if (fileUri) await deleteMediaFile(fileUri);
    router.dismissAll();
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{TITLES[type]}</Text>

        {type === "foto" && fileUri ? (
          <Image source={{ uri: fileUri }} style={styles.mediaPreview} />
        ) : null}

        {type === "video" && fileUri ? (
          <Video
            source={{ uri: fileUri }}
            style={styles.mediaPreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : null}

        {type === "voz" && params.transcriptStatus === "unavailable" ? (
          <Text style={styles.hint}>
            Este teléfono no pudo transcribir automáticamente — puedes escribir
            una descripción corta a mano.
          </Text>
        ) : null}

        <Text style={styles.label}>Área</Text>
        <AreaPicker value={areaId} onChange={setAreaId} allowNone />

        <TextField
          label={isTextNote ? "Contenido *" : "Descripción"}
          value={description}
          onChangeText={setDescription}
          placeholder={
            isTextNote
              ? "Escribe la nota…"
              : "Ej. Medida de muro, referencia de instalación…"
          }
          multiline
          numberOfLines={isTextNote ? 6 : 3}
          style={styles.multiline}
        />

        <Button
          label="Guardar nota"
          onPress={handleSave}
          disabled={!canSave}
          loading={saving}
        />
        {fileUri ? (
          <Button label="Descartar" variant="ghost" onPress={handleDiscard} />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: colors.ink,
  },
  mediaPreview: {
    width: "100%",
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  hint: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});
