import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";

import { Button } from "@/components/Button";
import { TextField } from "@/components/TextField";
import { spacing } from "@/theme";

import { StatusPicker } from "./StatusPicker";
import type { Client, ClientInput } from "./types";

type ClientFormProps = {
  initial?: Client;
  submitLabel: string;
  onSubmit: (input: ClientInput) => Promise<void>;
};

export function ClientForm({ initial, submitLabel, onSubmit }: ClientFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [siteAddress, setSiteAddress] = useState(initial?.siteAddress ?? "");
  const [contactName, setContactName] = useState(initial?.contactName ?? "");
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone ?? "");
  const [contactEmail, setContactEmail] = useState(initial?.contactEmail ?? "");
  const [generalNotes, setGeneralNotes] = useState(initial?.generalNotes ?? "");
  const [status, setStatus] = useState(initial?.status ?? "cotizacion");
  const [saving, setSaving] = useState(false);

  const canSave = name.trim().length > 0 && !saving;

  const handleSubmit = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        siteAddress: siteAddress.trim() || null,
        contactName: contactName.trim() || null,
        contactPhone: contactPhone.trim() || null,
        contactEmail: contactEmail.trim() || null,
        generalNotes: generalNotes.trim() || null,
        status,
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
          label="Nombre del cliente *"
          value={name}
          onChangeText={setName}
          placeholder="Ej. Familia Rodríguez"
        />
        <TextField
          label="Dirección de la obra"
          value={siteAddress}
          onChangeText={setSiteAddress}
          placeholder="Ej. Calle 10 # 5-20, apto 301"
        />
        <TextField
          label="Nombre de contacto"
          value={contactName}
          onChangeText={setContactName}
        />
        <TextField
          label="Teléfono de contacto"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
        />
        <TextField
          label="Correo de contacto"
          value={contactEmail}
          onChangeText={setContactEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextField
          label="Notas generales"
          value={generalNotes}
          onChangeText={setGeneralNotes}
          multiline
          numberOfLines={4}
          style={styles.multiline}
        />
        <StatusPicker value={status} onChange={setStatus} />
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
  multiline: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: spacing.sm,
  },
});
