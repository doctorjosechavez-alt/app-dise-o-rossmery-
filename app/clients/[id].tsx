import { useCallback, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import {
  deleteClient,
  getClient,
  updateClient,
} from "@/features/clients/clients.repository";
import { ClientForm } from "@/features/clients/ClientForm";
import type { Client, ClientInput } from "@/features/clients/types";
import { colors, spacing, typography } from "@/theme";

const HUB_SECTIONS = [
  { label: "Pinturas", description: "Marca, color y acabado por área" },
  { label: "Materiales y acabados", description: "Telas, pisos, madera, mármol…" },
  { label: "Notas de campo", description: "Foto, video, voz y texto" },
  { label: "Pendientes", description: "Tareas con recordatorio en calendario" },
];

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    getClient(id)
      .then(setClient)
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleUpdate = async (input: ClientInput) => {
    if (!id) return;
    const updated = await updateClient(id, input);
    setClient(updated);
    setEditing(false);
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert(
      "Eliminar cliente",
      "Se eliminará el cliente y todo lo que tenga asociado (pinturas, materiales, notas, pendientes). Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteClient(id);
            router.replace("/");
          },
        },
      ]
    );
  };

  if (loading) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  if (!client) {
    return (
      <ScreenContainer>
        <Text style={styles.notFound}>No se encontró este cliente.</Text>
      </ScreenContainer>
    );
  }

  if (editing) {
    return (
      <ScreenContainer>
        <ClientForm
          initial={client}
          submitLabel="Guardar cambios"
          onSubmit={handleUpdate}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.name}>{client.name}</Text>
          <StatusBadge status={client.status} />
        </View>

        <Card style={styles.infoCard}>
          {client.siteAddress ? (
            <InfoRow label="Dirección de la obra" value={client.siteAddress} />
          ) : null}
          {client.contactName ? (
            <InfoRow label="Contacto" value={client.contactName} />
          ) : null}
          {client.contactPhone ? (
            <InfoRow label="Teléfono" value={client.contactPhone} />
          ) : null}
          {client.contactEmail ? (
            <InfoRow label="Correo" value={client.contactEmail} />
          ) : null}
          {client.generalNotes ? (
            <InfoRow label="Notas" value={client.generalNotes} />
          ) : null}
        </Card>

        <Text style={styles.sectionTitle}>De este proyecto</Text>
        <View style={styles.hubList}>
          {HUB_SECTIONS.map((section) => (
            <Card key={section.label} style={styles.hubCard}>
              <Text style={styles.hubLabel}>{section.label}</Text>
              <Text style={styles.hubDescription}>{section.description}</Text>
              <Text style={styles.hubComingSoon}>Próximamente</Text>
            </Card>
          ))}
        </View>

        <View style={styles.actions}>
          <Button label="Editar" variant="secondary" onPress={() => setEditing(true)} />
          <Button label="Eliminar cliente" variant="ghost" onPress={handleDelete} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.headingBold,
    fontSize: 28,
    color: colors.ink,
  },
  infoCard: {
    gap: spacing.sm,
  },
  infoRow: {
    gap: 2,
  },
  infoLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 13,
    color: colors.muted,
  },
  infoValue: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.ink,
  },
  sectionTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: colors.ink,
  },
  hubList: {
    gap: spacing.sm,
  },
  hubCard: {
    gap: 2,
  },
  hubLabel: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  hubDescription: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
  },
  hubComingSoon: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    color: colors.blue,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.sm,
  },
  notFound: {
    fontFamily: typography.body,
    fontSize: 16,
    color: colors.muted,
  },
});
