import { useLocalSearchParams, useRouter } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { PaintForm } from "@/features/paints/PaintForm";
import { createPaint } from "@/features/paints/paints.repository";
import type { PaintInput } from "@/features/paints/types";

export default function NewPaintScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const handleSubmit = async (input: PaintInput) => {
    if (!id) return;
    await createPaint(id, input);
    router.back();
  };

  return (
    <ScreenContainer>
      <PaintForm submitLabel="Guardar pintura" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
