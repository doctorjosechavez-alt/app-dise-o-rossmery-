import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { TaskForm } from "@/features/tasks/TaskForm";
import {
  deleteTask,
  getTask,
  setTaskArchived,
  updateTask,
} from "@/features/tasks/tasks.repository";
import type { Task, TaskInput } from "@/features/tasks/types";
import { spacing } from "@/theme";

export default function TaskDetailScreen() {
  const { taskId } = useLocalSearchParams<{ id: string; taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!taskId) return;
      setLoading(true);
      getTask(taskId)
        .then(setTask)
        .finally(() => setLoading(false));
    }, [taskId])
  );

  const handleUpdate = async (input: TaskInput) => {
    if (!taskId) return;
    const updated = await updateTask(taskId, input);
    setTask(updated);
    router.back();
  };

  const handleToggleArchived = async () => {
    if (!taskId || !task) return;
    await setTaskArchived(taskId, !task.archived);
    router.back();
  };

  const handleDelete = () => {
    if (!taskId) return;
    Alert.alert(
      "Eliminar pendiente",
      "También se borrará el recordatorio del calendario si lo tiene. Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await deleteTask(taskId);
            router.back();
          },
        },
      ]
    );
  };

  if (loading || !task) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <TaskForm
        initial={task}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
      />
      <View style={{ marginTop: spacing.sm, gap: spacing.sm }}>
        <Button
          label={task.archived ? "Desarchivar" : "Archivar"}
          variant="secondary"
          onPress={handleToggleArchived}
        />
        <Button label="Eliminar pendiente" variant="ghost" onPress={handleDelete} />
      </View>
    </ScreenContainer>
  );
}
