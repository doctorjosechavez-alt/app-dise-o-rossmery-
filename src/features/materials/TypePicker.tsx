import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

import { MATERIAL_TYPES, MATERIAL_TYPE_LABEL, MaterialType } from "./types";

type TypePickerProps = {
  value: MaterialType;
  onChange: (type: MaterialType) => void;
};

export function TypePicker({ value, onChange }: TypePickerProps) {
  return (
    <View style={styles.row}>
      {MATERIAL_TYPES.map((type) => {
        const selected = type === value;
        return (
          <Pressable
            key={type}
            onPress={() => onChange(type)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {MATERIAL_TYPE_LABEL[type]}
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
    backgroundColor: colors.terracotta,
    borderColor: colors.terracotta,
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
