import { useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { colors, radius, spacing, touchTarget, typography } from "@/theme";

const DEFAULT_HOUR = 9;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type DueDatePickerProps = {
  value: string | null;
  onChange: (iso: string | null) => void;
};

export function DueDatePicker({ value, onChange }: DueDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === "android") setShowPicker(false);
    if (event.type === "dismissed" || !selected) return;

    const withDefaultTime = new Date(selected);
    withDefaultTime.setHours(DEFAULT_HOUR, 0, 0, 0);
    onChange(withDefaultTime.toISOString());
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Fecha</Text>
      <Pressable style={styles.field} onPress={() => setShowPicker(true)}>
        <Text style={value ? styles.valueText : styles.placeholderText}>
          {value ? formatDate(value) : "Sin fecha — toca para agregar"}
        </Text>
      </Pressable>
      {value ? (
        <Pressable onPress={() => onChange(null)}>
          <Text style={styles.remove}>Quitar fecha</Text>
        </Pressable>
      ) : null}

      {showPicker ? (
        <DateTimePicker
          value={value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={handleChange}
          minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  field: {
    minHeight: touchTarget.minHeight,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.background,
  },
  valueText: {
    fontFamily: typography.body,
    fontSize: 17,
    color: colors.ink,
  },
  placeholderText: {
    fontFamily: typography.body,
    fontSize: 17,
    color: colors.muted,
  },
  remove: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.terracotta,
    alignSelf: "flex-start",
  },
});
