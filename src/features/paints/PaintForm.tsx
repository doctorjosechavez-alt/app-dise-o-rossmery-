import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { AreaPicker } from "@/features/areas/AreaPicker";
import { colors, spacing, typography } from "@/theme";

import type { Paint, PaintInput } from "./types";

type PaintFormProps = {
  initial?: Paint;
  submitLabel: string;
  onSubmit: (input: PaintInput) => Promise<void>;
};

export function PaintForm({ initial, submitLabel, onSubmit }: PaintFormProps) {
  const [areaId, setAreaId] = useState<string | null>(initial?.areaId ?? null);
  const [brand, setBrand] = useState(initial?.brand ?? "");
  const [colorCode, setColorCode] = useState(initial?.colorCode ?? "");
  const [colorName, setColorName] = useState(initial?.colorName ?? "");
  const [finish, setFinish] = useState(initial?.finish ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [saving, setSaving] = useState(false);

  const canSave = !!areaId && !saving;

  const handleSubmit = async () => {
    if (!areaId || saving) return;
    setSaving(true);
    try {
      await onSubmit({
        areaId,
        brand: brand.trim() || null,
        colorCode: colorCode.trim() || null,
        colorName: colorName.trim() || null,
        finish: finish.trim() || null,
        note: note.trim() || null,
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
        <Text style={styles.label}>Área *</Text>
        <AreaPicker value={areaId} onChange={setAreaId} />

        <TextField
          label="Marca"
          value={brand}
          onChangeText={setBrand}
          placeholder="Ej. Pintuco"
        />
        <TextField
          label="Código de color"
          value={colorCode}
          onChangeText={setColorCode}
          placeholder="Ej. C-3040"
        />
        <TextField
          label="Nombre del color"
          value={colorName}
          onChangeText={setColorName}
          placeholder="Ej. Blanco hueso"
        />
        <TextField
          label="Acabado"
          value={finish}
          onChangeText={setFinish}
          placeholder="Ej. Mate, satinado, semi-mate…"
        />
        <TextField
          label="Nota adicional"
          value={note}
          onChangeText={setNote}
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
