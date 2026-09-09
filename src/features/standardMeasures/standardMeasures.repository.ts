import { getReadyDb } from "@/db/client";

import type { StandardMeasure } from "./types";

type StandardMeasureRow = {
  id: string;
  category: string;
  item: string;
  value_text: string;
  value_min_cm: number | null;
  value_max_cm: number | null;
  notes: string | null;
};

function toStandardMeasure(row: StandardMeasureRow): StandardMeasure {
  return {
    id: row.id,
    category: row.category,
    item: row.item,
    valueText: row.value_text,
    valueMinCm: row.value_min_cm,
    valueMaxCm: row.value_max_cm,
    notes: row.notes,
  };
}

// Biblioteca fija de referencia — solo lectura desde la app (ver
// src/db/seed/standardMeasures.ts).
export async function listStandardMeasures(): Promise<StandardMeasure[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<StandardMeasureRow>(
    "SELECT * FROM standard_measures ORDER BY category ASC, item ASC"
  );
  return rows.map(toStandardMeasure);
}

// Búsqueda simple por palabra clave sobre categoría, ítem y notas.
export async function searchStandardMeasures(
  query: string
): Promise<StandardMeasure[]> {
  const db = await getReadyDb();
  const term = `%${query.trim()}%`;
  const rows = await db.getAllAsync<StandardMeasureRow>(
    `SELECT * FROM standard_measures
     WHERE category LIKE ? COLLATE NOCASE
        OR item LIKE ? COLLATE NOCASE
        OR notes LIKE ? COLLATE NOCASE
     ORDER BY category ASC, item ASC`,
    term,
    term,
    term
  );
  return rows.map(toStandardMeasure);
}
