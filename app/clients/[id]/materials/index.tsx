import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { listMaterialsByClient } from "@/features/materials/materials.repository";
import { MATERIAL_TYPE_LABEL, MaterialType } from "@/features/materials/types";
import type { Material } from "@/features/materials/types";
import { colors, radius, spacing, typography } from "@/theme";

export default function MaterialsListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<MaterialType | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      let cancelled = false;
      setLoading(true);
      listMaterialsByClient(id)
        .then((result) => {
          if (!cancelled) setMaterials(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [id])
  );

  const typesPresent = Array.from(new Set(materials.map((m) => m.type)));
  const visibleMaterials = typeFilter
    ? materials.filter((m) => m.type === typeFilter)
    : materials;

  return (
    <ScreenContainer>
      {typesPresent.length > 0 ? (
        <View style={styles.filterRow}>
          <FilterChip
            label="Todos"
            selected={typeFilter === null}
            onPress={() => setTypeFilter(null)}
          />
          {typesPresent.map((type) => (
            <FilterChip
              key={type}
              label={MATERIAL_TYPE_LABEL[type]}
              selected={typeFilter === type}
              onPress={() => setTypeFilter(type)}
            />
          ))}
        </View>
      ) : null}

      <FlatList
        data={visibleMaterials}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay materiales</Text>
              <Text style={styles.emptyBody}>
                Toca &ldquo;Nuevo material&rdquo; para registrar una tela, piso, mueble…
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/clients/${id}/materials/${item.id}`)}
            style={styles.card}
          >
            <Text style={styles.type}>{MATERIAL_TYPE_LABEL[item.type]}</Text>
            <Text style={styles.name}>{item.nameReference}</Text>
            {item.supplier ? (
              <Text style={styles.detail}>{item.supplier}</Text>
            ) : null}
          </Card>
        )}
      />
      <Button
        label="Nuevo material"
        onPress={() => router.push(`/clients/${id}/materials/new`)}
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
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
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
  type: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.terracotta,
  },
  name: {
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
