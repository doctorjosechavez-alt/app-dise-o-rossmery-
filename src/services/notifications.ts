import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

// Recordatorios locales para pendientes con fecha. Son notificaciones
// programadas en el propio teléfono (no dependen de internet ni de un
// servidor push) — se disparan a la hora exacta de la fecha del
// pendiente, la misma que queda en el calendario nativo.

const ANDROID_CHANNEL_ID = "pendientes";

// Se llama una sola vez al iniciar la app (ver app/_layout.tsx).
export async function configureNotifications(): Promise<void> {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: "Pendientes",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

// Programa un recordatorio para la fecha exacta del pendiente. Devuelve
// el id de la notificación (para poder cancelarla/reprogramarla), o null
// si el permiso fue negado o la fecha ya pasó.
export async function scheduleTaskNotification(
  title: string,
  body: string | null,
  date: Date
): Promise<string | null> {
  if (date.getTime() <= Date.now()) return null;

  const granted = await ensurePermission();
  if (!granted) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Pendiente: ${title}`,
      body: body ?? undefined,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: Platform.OS === "android" ? ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function cancelTaskNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // Ya no existía — nada que hacer.
  }
}
