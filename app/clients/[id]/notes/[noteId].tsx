import { useCallback, useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Audio, ResizeMode, Video } from "expo-av";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TextField } from "@/components/TextField";
import { AreaPicker } from "@/features/areas/AreaPicker";
import {
  deleteFieldNote,
  getFieldNote,
  updateFieldNoteDetails,
} from "@/features/fieldNotes/fieldNotes.repository";
import { FIELD_NOTE_TYPE_LABEL } from "@/features/fieldNotes/types";
import type { FieldNote } from "@/features/fieldNotes/types";
import { colors, radius, spacing, typography } from "@/theme";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AudioPlayer({ uri }: { uri: string }) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      sound?.unloadAsync();
    };
  }, [sound]);

  const handlePress = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return;
    }
    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      }
    );
    setSound(newSound);
    setIsPlaying(true);
  };

  return (
    <Pressable style={styles.audioButton} onPress={handlePress}>
      <Text style={styles.audioButtonLabel}>
        {isPlaying ? "⏸ Pausar" : "▶ Reproducir nota de voz"}
      </Text>
    </Pressable>
  );
}

export default function FieldNoteDetailScreen() {
  const { noteId } = useLocalSearchParams<{ id: string; noteId: string }>();
  const router = useRouter();
  const [note, setNote] = useState<FieldNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [areaId, setAreaId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!noteId) return;
      setLoading(true);
      getFieldNote(noteId)
        .then((result) => {
          setNote(result);
          setAreaId(result?.areaId ?? null);
          setDescription(result?.description ?? "");
        })
        .finally(() => setLoading(false));
    }, [noteId])
  );

  const isTextNote = note?.type === "texto";
  const canSave = !saving && (!isTextNote || description.trim().length > 0);

  const handleSave = async () => {
    if (!noteId || !canSave) return;
    setSaving(true);
    try {
      const updated = await updateFieldNoteDetails(noteId, {
        areaId,
        description: description.trim() || null,
      });
      setNote(updated);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!noteId) return;
    Alert.alert("Eliminar nota", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteFieldNote(noteId);
          router.back();
        },
      },
    ]);
  };

  if (loading || !note) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.type}>{FIELD_NOTE_TYPE_LABEL[note.type]}</Text>
          <Text style={styles.date}>{formatDate(note.recordedAt)}</Text>
        </View>

        {note.type === "foto" && note.fileUri ? (
          <Image source={{ uri: note.fileUri }} style={styles.mediaPreview} />
        ) : null}

        {note.type === "video" && note.fileUri ? (
          <Video
            source={{ uri: note.fileUri }}
            style={styles.mediaPreview}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
          />
        ) : null}

        {note.type === "voz" && note.fileUri ? (
          <AudioPlayer uri={note.fileUri} />
        ) : null}

        {note.type === "voz" ? (
          <View style={styles.transcriptBox}>
            <Text style={styles.transcriptLabel}>Transcripción</Text>
            {note.transcriptStatus === "done" && note.transcript ? (
              <Text style={styles.transcriptText}>{note.transcript}</Text>
            ) : note.transcriptStatus === "pending" ? (
              <Text style={styles.transcriptMuted}>Transcribiendo…</Text>
            ) : (
              <Text style={styles.transcriptMuted}>
                No disponible en este teléfono — usa la descripción de abajo.
              </Text>
            )}
          </View>
        ) : null}

        <Text style={styles.label}>Área</Text>
        <AreaPicker value={areaId} onChange={setAreaId} allowNone />

        <TextField
          label={isTextNote ? "Contenido *" : "Descripción"}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={isTextNote ? 6 : 3}
          style={styles.multiline}
        />

        <View style={styles.actions}>
          <Button
            label="Guardar cambios"
            onPress={handleSave}
            disabled={!canSave}
            loading={saving}
          />
          <Button label="Eliminar nota" variant="ghost" onPress={handleDelete} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  type: {
    fontFamily: typography.headingBold,
    fontSize: 20,
    color: colors.ink,
  },
  date: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
  },
  mediaPreview: {
    width: "100%",
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  audioButton: {
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    backgroundColor: colors.terracotta,
  },
  audioButtonLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.background,
  },
  transcriptBox: {
    gap: spacing.xs,
  },
  transcriptLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  transcriptText: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink,
  },
  transcriptMuted: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
});
