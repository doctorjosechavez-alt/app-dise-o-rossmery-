import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";

import { initDb } from "@/db/client";
import { colors, fontAssets, typography } from "@/theme";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [dbReady, setDbReady] = useState(false);
  const [dbError, setDbError] = useState<Error | null>(null);

  useEffect(() => {
    initDb()
      .then(() => setDbReady(true))
      .catch((err) => setDbError(err instanceof Error ? err : new Error(String(err))));
  }, []);

  const ready = (fontsLoaded || !!fontError) && (dbReady || !!dbError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: typography.headingBold, fontSize: 20 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Clientes" }} />
        <Stack.Screen
          name="clients/new"
          options={{ title: "Nuevo cliente", presentation: "modal" }}
        />
        <Stack.Screen name="clients/[id]/index" options={{ title: "Cliente" }} />
        <Stack.Screen
          name="clients/[id]/paints/index"
          options={{ title: "Pinturas" }}
        />
        <Stack.Screen
          name="clients/[id]/paints/new"
          options={{ title: "Nueva pintura", presentation: "modal" }}
        />
        <Stack.Screen
          name="clients/[id]/paints/[paintId]"
          options={{ title: "Pintura" }}
        />
        <Stack.Screen
          name="clients/[id]/materials/index"
          options={{ title: "Materiales y acabados" }}
        />
        <Stack.Screen
          name="clients/[id]/materials/new"
          options={{ title: "Nuevo material", presentation: "modal" }}
        />
        <Stack.Screen
          name="clients/[id]/materials/[materialId]"
          options={{ title: "Material" }}
        />
        <Stack.Screen
          name="clients/[id]/tasks/index"
          options={{ title: "Pendientes" }}
        />
        <Stack.Screen
          name="clients/[id]/tasks/new"
          options={{ title: "Nuevo pendiente", presentation: "modal" }}
        />
        <Stack.Screen
          name="clients/[id]/tasks/[taskId]"
          options={{ title: "Pendiente" }}
        />
        <Stack.Screen
          name="clients/[id]/notes/index"
          options={{ title: "Notas de campo" }}
        />
        <Stack.Screen
          name="clients/[id]/notes/new"
          options={{ title: "Nueva nota", presentation: "modal" }}
        />
        <Stack.Screen
          name="clients/[id]/notes/camera"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="clients/[id]/notes/record"
          options={{ title: "Nota de voz" }}
        />
        <Stack.Screen
          name="clients/[id]/notes/save"
          options={{ title: "Guardar nota" }}
        />
        <Stack.Screen
          name="clients/[id]/notes/[noteId]"
          options={{ title: "Nota de campo" }}
        />
      </Stack>
    </>
  );
}
