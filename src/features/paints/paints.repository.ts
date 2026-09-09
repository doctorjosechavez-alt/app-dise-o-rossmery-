import { getReadyDb } from "@/db/client";
import { newId } from "@/db/uuid";

import type { Paint, PaintInput } from "./types";

type PaintRow = {
  id: string;
  client_id: string;
  area_id: string;
  area_name: string;
  brand: string | null;
  color_code: string | null;
  color_name: string | null;
  finish: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};

function toPaint(row: PaintRow): Paint {
  return {
    id: row.id,
    clientId: row.client_id,
    areaId: row.area_id,
    areaName: row.area_name,
    brand: row.brand,
    colorCode: row.color_code,
    colorName: row.color_name,
    finish: row.finish,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_PAINT = `
  SELECT paints.*, areas.name AS area_name
  FROM paints
  JOIN areas ON areas.id = paints.area_id
`;

export async function listPaintsByClient(clientId: string): Promise<Paint[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<PaintRow>(
    `${SELECT_PAINT}
     WHERE paints.client_id = ?
     ORDER BY areas.sort_order ASC, paints.created_at DESC`,
    clientId
  );
  return rows.map(toPaint);
}

export async function getPaint(id: string): Promise<Paint | null> {
  const db = await getReadyDb();
  const row = await db.getFirstAsync<PaintRow>(
    `${SELECT_PAINT} WHERE paints.id = ?`,
    id
  );
  return row ? toPaint(row) : null;
}

export async function createPaint(
  clientId: string,
  input: PaintInput
): Promise<Paint> {
  const db = await getReadyDb();
  const id = newId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO paints
      (id, client_id, area_id, brand, color_code, color_name, finish, note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    clientId,
    input.areaId,
    input.brand ?? null,
    input.colorCode ?? null,
    input.colorName ?? null,
    input.finish ?? null,
    input.note ?? null,
    now,
    now
  );

  const created = await getPaint(id);
  if (!created) throw new Error("No se pudo crear la pintura");
  return created;
}

export async function updatePaint(
  id: string,
  input: PaintInput
): Promise<Paint> {
  const db = await getReadyDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE paints SET
       area_id = ?, brand = ?, color_code = ?, color_name = ?, finish = ?,
       note = ?, updated_at = ?
     WHERE id = ?`,
    input.areaId,
    input.brand ?? null,
    input.colorCode ?? null,
    input.colorName ?? null,
    input.finish ?? null,
    input.note ?? null,
    now,
    id
  );

  const updated = await getPaint(id);
  if (!updated) throw new Error("Pintura no encontrada");
  return updated;
}

export async function deletePaint(id: string): Promise<void> {
  const db = await getReadyDb();
  await db.runAsync("DELETE FROM paints WHERE id = ?", id);
}
