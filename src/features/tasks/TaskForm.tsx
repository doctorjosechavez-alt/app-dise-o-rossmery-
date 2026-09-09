import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { colors, spacing, typography } from "@/theme";

import { DueDatePicker } from "./DueDatePicker";
import { PriorityPicker } from "./PriorityPicker";
import type { Task, TaskInput } from "./types";

type TaskFormProps = {
  initial?: Task;
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<void>;
};

export function TaskForm({ initial, submitLabel, onSubmit }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "media");
  const [dueDate, setDueDate] = useState<string | null>(initial?.dueDate ?? null);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        dueDate,
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
        <TextField
          label="Título *"
          value={title}
          onChangeText={setTitle}
          placeholder="Ej. Confirmar medida de mesón"
        />
        <TextField
          label="Detalle"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.multiline}
        />

        <Text style={styles.label}>Prioridad</Text>
        <PriorityPicker value={priority} onChange={setPriority} />

        <DueDatePicker value={dueDate} onChange={setDueDate} />

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
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});
