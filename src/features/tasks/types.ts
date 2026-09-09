export type TaskPriority = "alta" | "media" | "baja";

export const TASK_PRIORITIES: TaskPriority[] = ["alta", "media", "baja"];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
};

export type Task = {
  id: string;
  clientId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  dueDate: string | null;
  done: boolean;
  doneAt: string | null;
  archived: boolean;
  calendarEventId: string | null;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
};
