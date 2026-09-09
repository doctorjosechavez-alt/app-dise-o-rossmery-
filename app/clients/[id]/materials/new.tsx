import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { MaterialForm } from "@/features/materials/MaterialForm";
import { createMaterial } from "@/features/materials/materials.repository";
import type { MaterialInput } from "@/features/materials/types";

export default function NewMaterialScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleSubmit = async (input: MaterialInput) => {
    if (!id) return;
    await createMaterial(id, input);
    router.back();
  };

  return (
    <ScreenContainer>
      <MaterialForm submitLabel="Guardar material" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
