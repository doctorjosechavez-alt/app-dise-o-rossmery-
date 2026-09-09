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
      </Stack>
    </>
  );
}
