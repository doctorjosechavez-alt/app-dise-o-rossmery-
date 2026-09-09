import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { colors, spacing, typography } from "@/theme";

import { TypePicker } from "./TypePicker";
import type { Material, MaterialInput } from "./types";

type MaterialFormProps = {
  initial?: Material;
  submitLabel: string;
  onSubmit: (input: MaterialInput) => Promise<void>;
};

export function MaterialForm({
  initial,
  submitLabel,
  onSubmit,
}: MaterialFormProps) {
  const [type, setType] = useState(initial?.type ?? "tela");
  const [nameReference, setNameReference] = useState(
    initial?.nameReference ?? ""
  );
  const [supplier, setSupplier] = useState(initial?.supplier ?? "");
  const [detail, setDetail] = useState(initial?.detail ?? "");
  const [saving, setSaving] = useState(false);

  const canSave = nameReference.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSubmit({
        type,
        nameReference: nameReference.trim(),
        supplier: supplier.trim() || null,
        detail: detail.trim() || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Tipo *</Text>
        <TypePicker value={type} onChange={setType} />

        <TextField
          label="Nombre / referencia *"
          value={nameReference}
          onChangeText={setNameReference}
          placeholder="Ej. Lino beige, Porcelanato Travertino…"
        />
        <TextField
          label="Proveedor"
          value={supplier}
          onChangeText={setSupplier}
          placeholder="Ej. Almacén Corona"
        />
        <TextField
          label="Detalle"
          value={detail}
          onChangeText={setDetail}
          placeholder="Metraje, precio, link de compra…"
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />

        <Button
          label={submitLabel}
          onPress={handleSubmit}
          disabled={!canSave}
          loading={saving}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  label: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});
