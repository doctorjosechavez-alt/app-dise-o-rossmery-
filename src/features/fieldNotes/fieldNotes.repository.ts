import { getReadyDb } from "@/db/client";
import { newId } from "@/db/uuid";
import { deleteMediaFile } from "@/services/fileStorage";

import type { FieldNote, FieldNoteInput, FieldNoteType, TranscriptStatus } from "./types";

type FieldNoteRow = {
  id: string;
  client_id: string;
  area_id: string | null;
  area_name: string | null;
  type: FieldNoteType;
  file_uri: string | null;
  media_library_id: string | null;
  duration_seconds: number | null;
  description: string | null;
  transcript: string | null;
  transcript_status: TranscriptStatus;
  recorded_at: string;
  created_at: string;
  updated_at: string;
};

function toFieldNote(row: FieldNoteRow): FieldNote {
  return {
    id: row.id,
    clientId: row.client_id,
    areaId: row.area_id,
    areaName: row.area_name,
    type: row.type,
    fileUri: row.file_uri,
    mediaLibraryId: row.media_library_id,
    durationSeconds: row.duration_seconds,
    description: row.description,
    transcript: row.transcript,
    transcriptStatus: row.transcript_status,
    recordedAt: row.recorded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_FIELD_NOTE = `
  SELECT field_notes.*, areas.name AS area_name
  FROM field_notes
  LEFT JOIN areas ON areas.id = field_notes.area_id
`;

export async function listFieldNotesByClient(
  clientId: string
): Promise<FieldNote[]> {
  const db = await getReadyDb();
  const rows = await db.getAllAsync<FieldNoteRow>(
    `${SELECT_FIELD_NOTE}
     WHERE field_notes.client_id = ?
     ORDER BY field_notes.recorded_at DESC`,
    clientId
  );
  return rows.map(toFieldNote);
}

export async function getFieldNote(id: string): Promise<FieldNote | null> {
  const db = await getReadyDb();
  const row = await db.getFirstAsync<FieldNoteRow>(
    `${SELECT_FIELD_NOTE} WHERE field_notes.id = ?`,
    id
  );
  return row ? toFieldNote(row) : null;
}

export async function createFieldNote(
  clientId: string,
  input: FieldNoteInput
): Promise<FieldNote> {
  const db = await getReadyDb();
  const id = newId();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO field_notes
      (id, client_id, area_id, type, file_uri, media_library_id,
       duration_seconds, description, transcript, transcript_status,
       recorded_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    clientId,
    input.areaId ?? null,
    input.type,
    input.fileUri ?? null,
    input.mediaLibraryId ?? null,
    input.durationSeconds ?? null,
    input.description ?? null,
    input.transcript ?? null,
    input.transcriptStatus ?? "not_applicable",
    input.recordedAt,
    now,
    now
  );

  const created = await getFieldNote(id);
  if (!created) throw new Error("No se pudo crear la nota de campo");
  return created;
}

// Solo para editar los campos que la usuaria controla desde la ficha de
// la nota (área y descripción) — el archivo y la transcripción no se
// reemplazan desde aquí.
export async function updateFieldNoteDetails(
  id: string,
  input: { areaId: string | null; description: string | null }
): Promise<FieldNote> {
  const db = await getReadyDb();
  const now = new Date().toISOString();

  await db.runAsync(
    `UPDATE field_notes SET area_id = ?, description = ?, updated_at = ? WHERE id = ?`,
    input.areaId,
    input.description,
    now,
    id
  );

  const updated = await getFieldNote(id);
  if (!updated) throw new Error("Nota de campo no encontrada");
  return updated;
}

export async function updateFieldNoteTranscript(
  id: string,
  transcript: string | null,
  status: TranscriptStatus
): Promise<void> {
  const db = await getReadyDb();
  const now = new Date().toISOString();
  await db.runAsync(
    `UPDATE field_notes SET transcript = ?, transcript_status = ?, updated_at = ? WHERE id = ?`,
    transcript,
    status,
    now,
    id
  );
}

export async function deleteFieldNote(id: string): Promise<void> {
  const db = await getReadyDb();
  const note = await getFieldNote(id);
  if (note?.fileUri) {
    await deleteMediaFile(note.fileUri);
  }
  await db.runAsync("DELETE FROM field_notes WHERE id = ?", id);
}
