import { getReadyDb } from "@/db/client";
import { newId } from "@/db/uuid";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/services/calendar";
import {
  cancelTaskNotification,
  scheduleTaskNotification,
} from "@/services/notifications";

import type { Task, TaskInput, TaskPriority } from "./types";

type TaskRow = {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  due_date: string | null;
  done: number;
  done_at: string | null;
  archived: number;
  calendar_event_id: string | null;
  notification_id: string | null;
  created_at: string;
  updated_at: string;
};

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    clientId: row.client_id,
    title: row.title,
    description: row.description,
    priority: row.priority,
    dueDate: row.due_date,
    done: row.done === 1,
    doneAt: row.done_at,
    archived: row.archived === 1,
    calendarEventId: row.calendar_event_id,
    notificationId: row.notification_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// No archivadas primero (pendientes antes de hechas, por prioridad y
// fecha), archivadas al final.
export async function listTasksByClient(clientId: string): Promise<Task[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<TaskRow>(
    `SELECT * FROM tasks
     WHERE client_id = ?
     ORDER BY
       archived ASC,
       done ASC,
       CASE priority WHEN 'alta' THEN 0 WHEN 'media' THEN 1 ELSE 2 END,
       (due_date IS NULL), due_date ASC,
       created_at DESC`,
    clientId
  );
  return rows.map(toTask);
}

export async function getTask(id: string): Promise<Task | null> {
  const db = await getReadyDb();
  const row = await db.getFirstAsync<TaskRow>(
    "SELECT * FROM tasks WHERE id = ?",
    id
  );
  return row ? toTask(row) : null;
}

export async function createTask(
  clientId: string,
  input: TaskInput
): Promise<Task> {
  const db = await getReadyDb();
  const id = newId();
  const now = new Date().toISOString();

  const calendarEventId = input.dueDate
    ? await createCalendarEvent({
        title: input.title,
        notes: input.description,
        dueDate: input.dueDate,
      })
    : null;

  const notificationId = input.dueDate
    ? await scheduleTaskNotification(
        input.title,
        input.description ?? null,
        new Date(input.dueDate)
      )
    : null;

  await db.runAsync(
    `INSERT INTO tasks
      (id, client_id, title, description, priority, due_date, done, done_at,
       archived, calendar_event_id, notification_id, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, NULL, 0, ?, ?, ?, ?)`,
    id,
    clientId,
    input.title,
    input.description ?? null,
    input.priority,
    input.dueDate ?? null,
    calendarEventId,
    notificationId,
    now,
    now
  );

  const created = await getTask(id);
  if (!created) throw new Error("No se pudo crear el pendiente");
  return created;
}

export async function updateTask(id: string, input: TaskInput): Promise<Task> {
  const db = await getReadyDb();
  const existing = await getTask(id);
  if (!existing) throw new Error("Pendiente no encontrado");

  let calendarEventId = existing.calendarEventId;

  if (input.dueDate && calendarEventId) {
    const ok = await updateCalendarEvent(calendarEventId, {
      title: input.title,
      notes: input.description,
      dueDate: input.dueDate,
    });
    if (!ok) calendarEventId = null;
  } else if (input.dueDate && !calendarEventId) {
    calendarEventId = await createCalendarEvent({
      title: input.title,
      notes: input.description,
      dueDate: input.dueDate,
    });
  } else if (!input.dueDate && calendarEventId) {
    await deleteCalendarEvent(calendarEventId);
    calendarEventId = null;
  }

  // Las notificaciones no se pueden "editar" — se cancela la anterior y,
  // si sigue habiendo fecha, se programa una nueva.
  if (existing.notificationId) {
    await cancelTaskNotification(existing.notificationId);
  }
  const notificationId = input.dueDate
    ? await scheduleTaskNotification(
        input.title,
        input.description ?? null,
        new Date(input.dueDate)
      )
    : null;

  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE tasks SET
       title = ?, description = ?, priority = ?, due_date = ?,
       calendar_event_id = ?, notification_id = ?, updated_at = ?
     WHERE id = ?`,
    input.title,
    input.description ?? null,
    input.priority,
    input.dueDate ?? null,
    calendarEventId,
    notificationId,
    now,
    id
  );

  const updated = await getTask(id);
  if (!updated) throw new Error("Pendiente no encontrado");
  return updated;
}

export async function setTaskDone(id: string, done: boolean): Promise<void> {
  const db = await getReadyDb();
  const now = new Date().toISOString();

  // Si ya se hizo, no tiene sentido seguir recordándolo.
  if (done) {
    const existing = await getTask(id);
    if (existing?.notificationId) {
      await cancelTaskNotification(existing.notificationId);
      await db.runAsync(
        "UPDATE tasks SET notification_id = NULL WHERE id = ?",
        id
      );
    }
  }

  await db.runAsync(
    "UPDATE tasks SET done = ?, done_at = ?, updated_at = ? WHERE id = ?",
    done ? 1 : 0,
    done ? now : null,
    now,
    id
  );
}

export async function setTaskArchived(
  id: string,
  archived: boolean
): Promise<void> {
  const db = await getReadyDb();
  const now = new Date().toISOString();
  await db.runAsync(
    "UPDATE tasks SET archived = ?, updated_at = ? WHERE id = ?",
    archived ? 1 : 0,
    now,
    id
  );
}

export async function deleteTask(id: string): Promise<void> {
  const db = await getReadyDb();
  const existing = await getTask(id);
  if (existing?.calendarEventId) {
    await deleteCalendarEvent(existing.calendarEventId);
  }
  if (existing?.notificationId) {
    await cancelTaskNotification(existing.notificationId);
  }
  await db.runAsync("DELETE FROM tasks WHERE id = ?", id);
}
