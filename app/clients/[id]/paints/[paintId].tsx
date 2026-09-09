import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { PaintForm } from "@/features/paints/PaintForm";
import {
  deletePaint,
  getPaint,
  updatePaint,
} from "@/features/paints/paints.repository";
import type { Paint, PaintInput } from "@/features/paints/types";
import { spacing } from "@/theme";

export default function PaintDetailScreen() {
  const { paintId } = useLocalSearchParams<{ id: string; paintId: string }>();
  const router = useRouter();
  const [paint, setPaint] = useState<Paint | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!paintId) return;
      setLoading(true);
      getPaint(paintId)
        .then(setPaint)
        .finally(() => setLoading(false));
    }, [paintId])
  );

  const handleUpdate = async (input: PaintInput) => {
    if (!paintId) return;
    const updated = await updatePaint(paintId, input);
    setPaint(updated);
    router.back();
  };

  const handleDelete = () => {
    if (!paintId) return;
    Alert.alert("Eliminar pintura", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deletePaint(paintId);
          router.back();
        },
      },
    ]);
  };

  if (loading || !paint) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <PaintForm
        initial={paint}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
      />
      <View style={{ marginTop: spacing.sm }}>
        <Button label="Eliminar pintura" variant="ghost" onPress={handleDelete} />
      </View>
    </ScreenContainer>
  );
}
