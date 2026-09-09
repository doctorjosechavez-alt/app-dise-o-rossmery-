import { useRouter } from "expo-router";

import { ScreenContainer } from "@/components/ScreenContainer";
import { createClient } from "@/features/clients/clients.repository";
import { ClientForm } from "@/features/clients/ClientForm";
import type { ClientInput } from "@/features/clients/types";

export default function NewClientScreen() {
  const router = useRouter();

  const handleSubmit = async (input: ClientInput) => {
    const client = await createClient(input);
    router.replace(`/clients/${client.id}`);
  };

  return (
    <ScreenContainer>
      <ClientForm submitLabel="Crear cliente" onSubmit={handleSubmit} />
    </ScreenContainer>
  );
}
