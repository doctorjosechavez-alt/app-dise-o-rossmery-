export type FieldNoteType = "foto" | "video" | "voz" | "texto";

export const FIELD_NOTE_TYPE_LABEL: Record<FieldNoteType, string> = {
  foto: "Foto",
  video: "Video",
  voz: "Nota de voz",
  texto: "Texto",
};

export type FieldNote = {
  id: string;
  clientId: string;
  areaId: string | null;
  areaName: string | null;
  type: FieldNoteType;
  fileUri: string | null;
  mediaLibraryId: string | null;
  durationSeconds: number | null;
  description: string | null;
  recordedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type FieldNoteInput = {
  areaId?: string | null;
  type: FieldNoteType;
  fileUri?: string | null;
  mediaLibraryId?: string | null;
  durationSeconds?: number | null;
  description?: string | null;
  recordedAt: string;
};
