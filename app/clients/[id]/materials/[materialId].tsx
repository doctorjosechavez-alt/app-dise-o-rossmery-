import { useCallback, useState } from "react";
import { Alert, View } from "react-native";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";

import { Button } from "@/components/Button";
import { ScreenContainer } from "@/components/ScreenContainer";
import { MaterialForm } from "@/features/materials/MaterialForm";
import {
  deleteMaterial,
  getMaterial,
  updateMaterial,
} from "@/features/materials/materials.repository";
import type { Material, MaterialInput } from "@/features/materials/types";
import { spacing } from "@/theme";

export default function MaterialDetailScreen() {
  const { materialId } = useLocalSearchParams<{
    id: string;
    materialId: string;
  }>();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (!materialId) return;
      setLoading(true);
      getMaterial(materialId)
        .then(setMaterial)
        .finally(() => setLoading(false));
    }, [materialId])
  );

  const handleUpdate = async (input: MaterialInput) => {
    if (!materialId) return;
    const updated = await updateMaterial(materialId, input);
    setMaterial(updated);
    router.back();
  };

  const handleDelete = () => {
    if (!materialId) return;
    Alert.alert("Eliminar material", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteMaterial(materialId);
          router.back();
        },
      },
    ]);
  };

  if (loading || !material) {
    return <ScreenContainer><View /></ScreenContainer>;
  }

  return (
    <ScreenContainer>
      <MaterialForm
        initial={material}
        submitLabel="Guardar cambios"
        onSubmit={handleUpdate}
      />
      <View style={{ marginTop: spacing.sm }}>
        <Button label="Eliminar material" variant="ghost" onPress={handleDelete} />
      </View>
    </ScreenContainer>
  );
}
