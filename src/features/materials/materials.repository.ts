import { getReadyDb } from "@/db/client";
import { newId } from "@/db/uuid";

import type { Material, MaterialInput, MaterialType } from "./types";

type MaterialRow = {
  id: string;
  client_id: string;
  type: MaterialType;
  name_reference: string;
  supplier: string | null;
  detail: string | null;
  created_at: string;
  updated_at: string;
};

function toMaterial(row: MaterialRow): Material {
  return {
    id: row.id,
    clientId: row.client_id,
    type: row.type,
    nameReference: row.name_reference,
    supplier: row.supplier,
    detail: row.detail,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listMaterialsByClient(
  clientId: string
): Promise<Material[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<MaterialRow>(
    `SELECT * FROM materials WHERE client_id = ? ORDER BY created_at DESC`,
    clientId
  );
  return rows.map(toMaterial);
}

export async function getMaterial(id: string): Promise<Material | null> {
  const db = await getReadyDb();
  const row = await db.getFirstAsync<MaterialRow>(
    "SELECT * FROM materials WHERE id = ?",
    id
  );
  return row ? toMaterial(row) : null;
}

export async function createMaterial(
  clientId: string,
  input: MaterialInput
): Promise<Material> {
  const db = await getReadyDb();
  const id = newId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO materials
      (id, client_id, type, name_reference, supplier, detail, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    clientId,
    input.type,
    input.nameReference,
    input.supplier ?? null,
    input.detail ?? null,
    now,
    now
  );

  const created = await getMaterial(id);
  if (!created) throw new Error("No se pudo crear el material");
  return created;
}

export async function updateMaterial(
  id: string,
  input: MaterialInput
): Promise<Material> {
  const db = await getReadyDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE materials SET
       type = ?, name_reference = ?, supplier = ?, detail = ?, updated_at = ?
     WHERE id = ?`,
    input.type,
    input.nameReference,
    input.supplier ?? null,
    input.detail ?? null,
    now,
    id
  );

  const updated = await getMaterial(id);
  if (!updated) throw new Error("Material no encontrado");
  return updated;
}

export async function deleteMaterial(id: string): Promise<void> {
  const db = await getReadyDb();
  await db.runAsync("DELETE FROM materials WHERE id = ?", id);
}
