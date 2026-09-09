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
import { listFieldNotesByClient } from "@/features/fieldNotes/fieldNotes.repository";
import { listMaterialsByClient } from "@/features/materials/materials.repository";
import { listPaintsByClient } from "@/features/paints/paints.repository";
import { listTasksByClient } from "@/features/tasks/tasks.repository";
import { colors, spacing, typography } from "@/theme";

type HubSection = {
  key: string;
  label: string;
  description: string;
  route: string;
  count: number;
  noun: [string, string]; // [singular, plural]
};

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [paintsCount, setPaintsCount] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [fieldNotesCount, setFieldNotesCount] = useState(0);
  const [tasksCount, setTasksCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      getClient(id),
      listPaintsByClient(id),
      listMaterialsByClient(id),
      listFieldNotesByClient(id),
      listTasksByClient(id),
    ])
      .then(([clientResult, paints, materials, fieldNotes, tasks]) => {
        setClient(clientResult);
        setPaintsCount(paints.length);
        setMaterialsCount(materials.length);
        setFieldNotesCount(fieldNotes.length);
        setTasksCount(tasks.filter((t) => !t.archived && !t.done).length);
      })
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

  const builtSections: HubSection[] = [
    {
      key: "paints",
      label: "Pinturas",
      description: "Marca, color y acabado por área",
      route: `/clients/${id}/paints`,
      count: paintsCount,
      noun: ["pintura", "pinturas"],
    },
    {
      key: "materials",
      label: "Materiales y acabados",
      description: "Telas, pisos, madera, mármol…",
      route: `/clients/${id}/materials`,
      count: materialsCount,
      noun: ["material", "materiales"],
    },
    {
      key: "fieldNotes",
      label: "Notas de campo",
      description: "Foto, video, voz y texto",
      route: `/clients/${id}/notes`,
      count: fieldNotesCount,
      noun: ["nota", "notas"],
    },
    {
      key: "tasks",
      label: "Pendientes",
      description: "Tareas con recordatorio en calendario",
      route: `/clients/${id}/tasks`,
      count: tasksCount,
      noun: ["pendiente por hacer", "pendientes por hacer"],
    },
  ];

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
          {builtSections.map((section) => (
            <Card
              key={section.key}
              onPress={() => router.push(section.route as never)}
              style={styles.hubCard}
            >
              <Text style={styles.hubLabel}>{section.label}</Text>
              <Text style={styles.hubDescription}>{section.description}</Text>
              <Text style={styles.hubCount}>
                {section.count === 0
                  ? `Sin ${section.noun[1]} todavía`
                  : `${section.count} ${section.count === 1 ? section.noun[0] : section.noun[1]}`}
              </Text>
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
  hubCount: {
    fontFamily: typography.bodyBold,
    fontSize: 12,
    color: colors.terracotta,
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
