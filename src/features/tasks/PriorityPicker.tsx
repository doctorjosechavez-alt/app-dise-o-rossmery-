import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

import { TASK_PRIORITIES, TASK_PRIORITY_LABEL, TaskPriority } from "./types";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  alta: "#9A3B34",
  media: colors.terracotta,
  baja: colors.blue,
};

type PriorityPickerProps = {
  value: TaskPriority;
  onChange: (priority: TaskPriority) => void;
};

export function PriorityPicker({ value, onChange }: PriorityPickerProps) {
  return (
    <View style={styles.row}>
      {TASK_PRIORITIES.map((priority) => {
        const selected = priority === value;
        const color = PRIORITY_COLOR[priority];
        return (
          <Pressable
            key={priority}
            onPress={() => onChange(priority)}
            style={[
              styles.pill,
              { borderColor: color },
              selected && { backgroundColor: color },
            ]}
          >
            <Text style={[styles.label, { color: selected ? colors.background : color }]}>
              {TASK_PRIORITY_LABEL[priority]}
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
    gap: spacing.sm,
  },
  pill: {
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 15,
  },
});
