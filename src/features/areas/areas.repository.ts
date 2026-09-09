import { getReadyDb } from "@/db/client";

import type { Area } from "./types";

// Catálogo fijo (ver src/db/seed/areas.ts) — solo lectura desde la app.
export async function listAreas(): Promise<Area[]> {
  const db = await getReadyDb();
  return db.getAllAsync<Area>(
    "SELECT id, name FROM areas ORDER BY sort_order ASC"
  );
}
