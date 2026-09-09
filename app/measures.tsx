import { useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";

import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { listStandardMeasures } from "@/features/standardMeasures/standardMeasures.repository";
import type { StandardMeasure } from "@/features/standardMeasures/types";
import { colors, radius, spacing, touchTarget, typography } from "@/theme";

// Quita acentos para que buscar "meson" encuentre "mesón".
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function StandardMeasuresScreen() {
  const [measures, setMeasures] = useState<StandardMeasure[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listStandardMeasures().then(setMeasures);
  }, []);

  const visibleMeasures = useMemo(() => {
    const term = normalize(query.trim());
    if (!term) return measures;
    return measures.filter((measure) => {
      const haystack = normalize(
        `${measure.category} ${measure.item} ${measure.notes ?? ""}`
      );
      return haystack.includes(term);
    });
  }, [measures, query]);

  return (
    <ScreenContainer>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Buscar por palabra clave — ej. mesón, lavamanos, cortina…"
        placeholderTextColor={colors.muted}
        style={styles.search}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={visibleMeasures}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyBody}>
              Prueba con otra palabra — ej. &ldquo;puerta&rdquo; o &ldquo;cocina&rdquo;.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Text style={styles.category}>{item.category}</Text>
            <Text style={styles.itemName}>{item.item}</Text>
            <Text style={styles.value}>{item.valueText}</Text>
            {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  search: {
    minHeight: touchTarget.minHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink,
    backgroundColor: colors.background,
  },
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  card: {
    gap: 2,
  },
  category: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.blue,
  },
  itemName: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.ink,
  },
  value: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.terracotta,
  },
  notes: {
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
