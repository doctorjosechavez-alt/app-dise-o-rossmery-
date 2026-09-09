import { useCallback, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { listTasksByClient, setTaskDone } from "@/features/tasks/tasks.repository";
import { TASK_PRIORITY_LABEL, TaskPriority } from "@/features/tasks/types";
import type { Task } from "@/features/tasks/types";
import { colors, radius, spacing, typography } from "@/theme";

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  alta: "#9A3B34",
  media: colors.terracotta,
  baja: colors.blue,
};

function formatDueDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    day: "numeric",
    month: "short",
  });
}

export default function TasksListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    listTasksByClient(id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleToggleDone = async (task: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, done: !t.done } : t))
    );
    await setTaskDone(task.id, !task.done);
    load();
  };

  const visibleTasks = tasks.filter((t) => showArchived || !t.archived);
  const archivedCount = tasks.filter((t) => t.archived).length;

  return (
    <ScreenContainer>
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Todavía no hay pendientes</Text>
              <Text style={styles.emptyBody}>
                Toca &ldquo;Nuevo pendiente&rdquo; para agregar la primera tarea.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          archivedCount > 0 ? (
            <Pressable
              onPress={() => setShowArchived((v) => !v)}
              style={styles.archivedToggle}
            >
              <Text style={styles.archivedToggleText}>
                {showArchived
                  ? "Ocultar archivadas"
                  : `Ver ${archivedCount} archivada${archivedCount === 1 ? "" : "s"}`}
              </Text>
            </Pressable>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={[styles.card, item.archived && styles.cardArchived]}>
            <View style={styles.row}>
              <Pressable
                onPress={() => handleToggleDone(item)}
                style={[
                  styles.checkbox,
                  item.done && styles.checkboxChecked,
                ]}
              >
                {item.done ? <Text style={styles.checkmark}>✓</Text> : null}
              </Pressable>
              <Pressable
                style={styles.content}
                onPress={() => router.push(`/clients/${id}/tasks/${item.id}`)}
              >
                <Text
                  style={[styles.title, item.done && styles.titleDone]}
                  numberOfLines={2}
                >
                  {item.title}
                </Text>
                <View style={styles.meta}>
                  <View
                    style={[
                      styles.priorityDot,
                      { backgroundColor: PRIORITY_COLOR[item.priority] },
                    ]}
                  />
                  <Text style={styles.metaText}>
                    {TASK_PRIORITY_LABEL[item.priority]}
                    {item.dueDate ? ` · ${formatDueDate(item.dueDate)}` : ""}
                    {item.notificationId ? " 🔔" : ""}
                  </Text>
                </View>
              </Pressable>
            </View>
          </Card>
        )}
      />
      <Button
        label="Nuevo pendiente"
        onPress={() => router.push(`/clients/${id}/tasks/new`)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  card: {
    padding: spacing.sm,
  },
  cardArchived: {
    opacity: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.blue,
    borderColor: colors.blue,
  },
  checkmark: {
    color: colors.background,
    fontFamily: typography.bodyBold,
    fontSize: 16,
  },
  content: {
    flex: 1,
    gap: 2,
    paddingVertical: spacing.xs,
  },
  title: {
    fontFamily: typography.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  titleDone: {
    textDecorationLine: "line-through",
    color: colors.muted,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metaText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.muted,
  },
  archivedToggle: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  archivedToggleText: {
    fontFamily: typography.bodyBold,
    fontSize: 14,
    color: colors.blue,
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
