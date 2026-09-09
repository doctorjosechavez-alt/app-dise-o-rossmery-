import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/theme";

import { CLIENT_STATUSES, ClientStatus } from "./types";

const STATUS_LABEL: Record<ClientStatus, string> = {
  cotizacion: "Cotización",
  en_obra: "En obra",
  entregado: "Entregado",
  pausado: "Pausado",
  cancelado: "Cancelado",
};

type StatusPickerProps = {
  value: ClientStatus;
  onChange: (status: ClientStatus) => void;
};

export function StatusPicker({ value, onChange }: StatusPickerProps) {
  return (
    <View style={styles.row}>
      {CLIENT_STATUSES.map((status) => {
        const selected = status === value;
        return (
          <Pressable
            key={status}
            onPress={() => onChange(status)}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {STATUS_LABEL[status]}
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
