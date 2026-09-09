import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { TaskForm } from "@/features/tasks/TaskForm";
import { createTask } from "@/features/tasks/tasks.repository";
import type { TaskInput } from "@/features/tasks/types";

export default function NewTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleSubmit = async (input: TaskInput) => {
    if (!id) return;
    await createTask(id, input);
    router.back();
  };

  return (
    <ScreenContainer>
      <TaskForm submitLabel="Guardar pendiente" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
