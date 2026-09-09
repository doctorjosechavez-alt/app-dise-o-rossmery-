import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { listFieldNotesByClient } from "@/features/fieldNotes/fieldNotes.repository";
import { FIELD_NOTE_TYPE_LABEL, FieldNoteType } from "@/features/fieldNotes/types";
import type { FieldNote } from "@/features/fieldNotes/types";
import { colors, radius, spacing, typography } from "@/theme";

const TYPE_FILTERS: FieldNoteType[] = ["foto", "video", "voz", "texto"];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function FieldNotesListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [notes, setNotes] = useState<FieldNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<FieldNoteType | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      setLoading(true);
      listFieldNotesByClient(id)
        .then((result) => {
          if (!cancelled) setNotes(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  const visibleNotes = typeFilter
    ? notes.filter((n) => n.type === typeFilter)
    : notes;

  return (
    <ScreenContainer>
      <View style={styles.filterRow}>
        <FilterChip
          label="Todas"
          selected={typeFilter === null}
          onPress={() => setTypeFilter(null)}
        />
        {TYPE_FILTERS.map((type) => (
          <FilterChip
            key={type}
            label={FIELD_NOTE_TYPE_LABEL[type]}
            selected={typeFilter === type}
            onPress={() => setTypeFilter(type)}
          />
        ))}
      </View>

      <FlatList
        data={visibleNotes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay notas de campo</Text>
              <Text style={styles.emptyBody}>
                Toca &ldquo;Nueva nota&rdquo; para grabar una foto, video, voz o texto.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/clients/${id}/notes/${item.id}`)}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.type}>{FIELD_NOTE_TYPE_LABEL[item.type]}</Text>
              <Text style={styles.date}>{formatDate(item.recordedAt)}</Text>
            </View>
            {item.areaName ? (
              <Text style={styles.area}>{item.areaName}</Text>
            ) : null}
            <Text style={styles.description} numberOfLines={2}>
              {item.description ||
                item.transcript ||
                (item.type === "foto"
                  ? "Sin descripción"
                  : item.transcriptStatus === "pending"
                    ? "Transcribiendo…"
                    : "Sin descripción")}
            </Text>
          </Card>
        )}
      />
      <Button
        label="Nueva nota"
        onPress={() => router.push(`/clients/${id}/notes/new`)}
      />
    </ScreenContainer>
  );
}

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[chipStyles.chip, selected && chipStyles.chipSelected]}
    >
      <Text style={[chipStyles.label, selected && chipStyles.labelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  labelSelected: {
    color: colors.background,
  },
});

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  card: {
    gap: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  type: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.terracotta,
  },
  date: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.muted,
  },
  area: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.blue,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.ink,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
});
