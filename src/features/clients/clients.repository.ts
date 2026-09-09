import { getReadyDb } from "@/db/client";
import { newId } from "@/db/uuid";

import type { Client, ClientInput, ClientStatus } from "./types";

type ClientRow = {
  id: string;
  name: string;
  site_address: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  general_notes: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
};

function toClient(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    siteAddress: row.site_address,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    generalNotes: row.general_notes,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listClients(): Promise<Client[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<ClientRow>(
    `SELECT * FROM clients
     ORDER BY
       CASE status WHEN 'cancelado' THEN 1 ELSE 0 END,
       name COLLATE NOCASE ASC`
  );
  return rows.map(toClient);
}

export async function getClient(id: string): Promise<Client | null> {
  const db = await getReadyDb();
  const row = await db.getFirstAsync<ClientRow>(
    "SELECT * FROM clients WHERE id = ?",
    id
  );
  return row ? toClient(row) : null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const db = await getReadyDb();
  const id = newId();
  const now = new Date().toISOString();
  const status = input.status ?? "cotizacion";

  await db.runAsync(
    `INSERT INTO clients
      (id, name, site_address, contact_name, contact_phone, contact_email,
       general_notes, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    input.name,
    input.siteAddress ?? null,
    input.contactName ?? null,
    input.contactPhone ?? null,
    input.contactEmail ?? null,
    input.generalNotes ?? null,
    status,
    now,
    now
  );

  const created = await getClient(id);
  if (!created) throw new Error("No se pudo crear el cliente");
  return created;
}

export async function updateClient(
  id: string,
  input: ClientInput
): Promise<Client> {
  const db = await getReadyDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE clients SET
       name = ?, site_address = ?, contact_name = ?, contact_phone = ?,
       contact_email = ?, general_notes = ?, status = ?, updated_at = ?
     WHERE id = ?`,
    input.name,
    input.siteAddress ?? null,
    input.contactName ?? null,
    input.contactPhone ?? null,
    input.contactEmail ?? null,
    input.generalNotes ?? null,
    input.status ?? "cotizacion",
    now,
    id
  );

  const updated = await getClient(id);
  if (!updated) throw new Error("Cliente no encontrado");
  return updated;
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getReadyDb();
  await db.runAsync("DELETE FROM clients WHERE id = ?", id);
}
