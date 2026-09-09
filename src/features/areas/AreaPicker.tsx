import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

import { listAreas } from "./areas.repository";
import type { Area } from "./types";

type AreaPickerProps = {
  value: string | null;
  onChange: (areaId: string | null) => void;
  // Muestra un chip "Sin área" que selecciona null — para notas que no
  // son de un área específica (ej. una nota de voz general del proyecto).
  allowNone?: boolean;
};

export function AreaPicker({ value, onChange, allowNone }: AreaPickerProps) {
  const [areas, setAreas] = useState<Area[] | null>(null);

  useEffect(() => {
    listAreas().then(setAreas);
  }, []);

  if (!areas) {
    return <ActivityIndicator color={colors.terracotta} />;
  }

  return (
    <View style={styles.row}>
      {allowNone ? (
        <Pressable
          onPress={() => onChange(null)}
          style={[styles.pill, value === null && styles.pillSelected]}
        >
          <Text style={[styles.label, value === null && styles.labelSelected]}>
            Sin área
          </Text>
        </Pressable>
      ) : null}
      {areas.map((area) => {
        const selected = area.id === value;
        return (
          <Pressable
            key={area.id}
            onPress={() => onChange(area.id)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {area.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  pill: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pillSelected: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
    color: colors.ink,
  },
  labelSelected: {
    color: colors.background,
  },
});
