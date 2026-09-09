import { Platform } from "react-native";
import * as Calendar from "expo-calendar";

// Wrapper sobre expo-calendar: crea/edita/borra eventos reales en el
// calendario nativo del teléfono (no un link) para los pendientes con
// fecha. Usa (o crea, en Android) un calendario local dedicado
// "Estudio de Obra" para no mezclar los recordatorios de trabajo con el
// calendario personal.

const LOCAL_CALENDAR_NAME = "Estudio de Obra";

let cachedCalendarId: string | null = null;

async function ensurePermission(): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === "granted";
}

async function getOrCreateCalendarId(): Promise<string> {
  if (cachedCalendarId) return cachedCalendarId;

  if (Platform.OS === "ios") {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    cachedCalendarId = defaultCalendar.id;
    return cachedCalendarId;
  }

  // Android: no hay "calendario por defecto" — se busca o se crea uno
  // local propio de la app.
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT
  );
  const existing = calendars.find((cal) => cal.title === LOCAL_CALENDAR_NAME);
  if (existing) {
    cachedCalendarId = existing.id;
    return cachedCalendarId;
  }

  const newCalendarId = await Calendar.createCalendarAsync({
    title: LOCAL_CALENDAR_NAME,
    color: "#A85C3B",
    entityType: Calendar.EntityTypes.EVENT,
    source: {
      isLocalAccount: true,
      name: LOCAL_CALENDAR_NAME,
      type: Calendar.SourceType.LOCAL,
    },
    name: LOCAL_CALENDAR_NAME,
    ownerAccount: LOCAL_CALENDAR_NAME,
    accessLevel: Calendar.CalendarAccessLevel.OWNER,
  });
  cachedCalendarId = newCalendarId;
  return newCalendarId;
}

export type CalendarTaskInput = {
  title: string;
  notes?: string | null;
  dueDate: string; // ISO 8601
};

// Crea un evento de un día en la fecha del pendiente. Devuelve el
// calendarEventId a guardar en tasks.calendar_event_id, o null si el
// permiso fue negado (el pendiente igual se guarda en la app; solo no
// queda en el calendario nativo).
export async function createCalendarEvent(
  input: CalendarTaskInput
): Promise<string | null> {
  const granted = await ensurePermission();
  if (!granted) return null;

  const calendarId = await getOrCreateCalendarId();
  const startDate = new Date(input.dueDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  return Calendar.createEventAsync(calendarId, {
    title: input.title,
    notes: input.notes ?? undefined,
    startDate,
    endDate,
    timeZone: undefined,
  });
}

export async function updateCalendarEvent(
  eventId: string,
  input: CalendarTaskInput
): Promise<boolean> {
  const granted = await ensurePermission();
  if (!granted) return false;

  const startDate = new Date(input.dueDate);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  try {
    await Calendar.updateEventAsync(eventId, {
      title: input.title,
      notes: input.notes ?? undefined,
      startDate,
      endDate,
    });
    return true;
  } catch {
    // El evento pudo haber sido borrado manualmente desde la app de
    // Calendario del teléfono — no es un error fatal para el pendiente.
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    await Calendar.deleteEventAsync(eventId);
  } catch {
    // Ya no existía — nada que hacer.
  }
}
