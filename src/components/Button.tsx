import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

import { colors, radius, spacing, touchTarget, typography } from "@/theme";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
};

// Botones grandes a propósito: se usan en obra, a veces con el teléfono
// sucio o con guantes puestos.
export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? colors.background : colors.terracotta}
        />
      ) : (
        <Text style={[styles.label, textVariantStyles[variant]]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: touchTarget.minHeight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 17,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.terracotta,
  },
  secondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.blue,
  },
  ghost: {
    backgroundColor: "transparent",
  },
});

const textVariantStyles = StyleSheet.create({
  primary: {
    color: colors.background,
  },
  secondary: {
    color: colors.blue,
  },
  ghost: {
    color: colors.ink,
  },
});
