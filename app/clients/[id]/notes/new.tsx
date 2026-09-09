import { StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Card } from "@/components/Card";
import { ScreenContainer } from "@/components/ScreenContainer";
import { colors, spacing, typography } from "@/theme";

const OPTIONS = [
  {
    key: "foto",
    label: "Foto",
    description: "Toma una foto con la cámara",
    route: "camera",
    params: { mode: "foto" },
  },
  {
    key: "video",
    label: "Video",
    description: "Graba un recorrido del espacio",
    route: "camera",
    params: { mode: "video" },
  },
  {
    key: "voz",
    label: "Nota de voz",
    description: "Graba una nota hablada — se transcribe sola cuando el teléfono lo permite",
    route: "record",
    params: {},
  },
  {
    key: "texto",
    label: "Texto",
    description: "Escribe una nota rápida",
    route: "save",
    params: { type: "texto" },
  },
] as const;

export default function NewFieldNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  return (
    <ScreenContainer>
      <Text style={styles.title}>¿Qué quieres registrar?</Text>
      <View style={styles.list}>
        {OPTIONS.map((option) => (
          <Card
            key={option.key}
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: `/clients/${id}/notes/${option.route}` as never,
                params: option.params,
              })
            }
          >
            <Text style={styles.label}>{option.label}</Text>
            <Text style={styles.description}>{option.description}</Text>
          </Card>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: typography.heading,
    fontSize: 22,
    color: colors.ink,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    gap: 2,
  },
  label: {
    fontFamily: typography.headingBold,
    fontSize: 19,
    color: colors.ink,
  },
  description: {
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.muted,
  },
});
