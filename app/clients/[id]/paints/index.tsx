import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { listPaintsByClient } from "@/features/paints/paints.repository";
import type { Paint } from "@/features/paints/types";
import { colors, radius, spacing, typography } from "@/theme";

export default function PaintsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [paints, setPaints] = useState<Paint[]>([]);
  const [loading, setLoading] = useState(true);
  const [areaFilter, setAreaFilter] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      setLoading(true);
      listPaintsByClient(id)
        .then((result) => {
          if (!cancelled) setPaints(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  const areaOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const paint of paints) {
      if (!seen.has(paint.areaId)) seen.set(paint.areaId, paint.areaName);
    }
    return Array.from(seen.entries()).map(([areaId, name]) => ({ areaId, name }));
  }, [paints]);

  const visiblePaints = areaFilter
    ? paints.filter((p) => p.areaId === areaFilter)
    : paints;

  return (
    <ScreenContainer>
      {areaOptions.length > 0 ? (
        <View style={styles.filterRow}>
          <FilterChip
            label="Todas"
            selected={areaFilter === null}
            onPress={() => setAreaFilter(null)}
          />
          {areaOptions.map((option) => (
            <FilterChip
              key={option.areaId}
              label={option.name}
              selected={areaFilter === option.areaId}
              onPress={() => setAreaFilter(option.areaId)}
            />
          ))}
        </View>
      ) : null}

      <FlatList
        data={visiblePaints}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay pinturas</Text>
              <Text style={styles.emptyBody}>
                Toca &ldquo;Nueva pintura&rdquo; para registrar el color de un área.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/clients/${id}/paints/${item.id}`)}
            style={styles.card}
          >
            <Text style={styles.area}>{item.areaName}</Text>
            <Text style={styles.colorName}>
              {item.colorName || item.colorCode || "Sin nombre de color"}
            </Text>
            <Text style={styles.detail}>
              {[item.brand, item.finish].filter(Boolean).join(" · ") || "—"}
            </Text>
          </Card>
        )}
      />
      <Button
        label="Nueva pintura"
        onPress={() => router.push(`/clients/${id}/paints/new`)}
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
  area: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.blue,
  },
  colorName: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.ink,
  },
  detail: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
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
