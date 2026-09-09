// 002_add_task_notifications — agrega el id de la notificación local
// programada para el recordatorio de un pendiente con fecha, para poder
// cancelarla/reprogramarla si la fecha cambia o el pendiente se borra.
// Mismo patrón que tasks.calendar_event_id.

export const MIGRATION_002_ADD_TASK_NOTIFICATIONS = `
ALTER TABLE tasks ADD COLUMN notification_id TEXT;
`;
