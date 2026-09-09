import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { StatusBadge } from "@/components/StatusBadge";
import { listClients } from "@/features/clients/clients.repository";
import type { Client } from "@/features/clients/types";
import { colors, spacing, typography } from "@/theme";

export default function ClientsListScreen() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      listClients()
        .then((result) => {
          if (!cancelled) setClients(result);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <ScreenContainer>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay clientes</Text>
              <Text style={styles.emptyBody}>
                Toca &ldquo;Nuevo cliente&rdquo; para crear la primera ficha de proyecto.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push(`/clients/${item.id}`)}
            style={styles.card}
          >
            <Text style={styles.clientName}>{item.name}</Text>
            {item.siteAddress ? (
              <Text style={styles.clientAddress}>{item.siteAddress}</Text>
            ) : null}
            <StatusBadge status={item.status} />
          </Card>
        )}
      />
      <Button label="Nuevo cliente" onPress={() => router.push("/clients/new")} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  card: {
    gap: spacing.xs,
  },
  clientName: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: colors.ink,
  },
  clientAddress: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.muted,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontFamily: typography.heading,
    fontSize: 20,
    color: colors.ink,
  },
  emptyBody: {
    fontFamily: typography.body,
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
});
