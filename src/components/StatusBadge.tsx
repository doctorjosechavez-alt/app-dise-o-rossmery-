import { StyleSheet, Text, View } from "react-native";

import type { ClientStatus } from "@/features/clients/types";
import { colors, radius, spacing, typography } from "@/theme";

const STATUS_LABEL: Record<ClientStatus, string> = {
  cotizacion: "Cotización",
  en_obra: "En obra",
  entregado: "Entregado",
  pausado: "Pausado",
  cancelado: "Cancelado",
};

const STATUS_COLOR: Record<ClientStatus, string> = {
  cotizacion: colors.blue,
  en_obra: colors.terracotta,
  entregado: "#4B7B4E",
  pausado: colors.muted,
  cancelado: "#9A3B34",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  const color = STATUS_COLOR[status];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.label, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1.5,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
  },
});
