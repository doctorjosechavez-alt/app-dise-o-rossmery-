export type FieldNoteType = "foto" | "video" | "voz" | "texto";

export const FIELD_NOTE_TYPE_LABEL: Record<FieldNoteType, string> = {
  foto: "Foto",
  video: "Video",
  voz: "Nota de voz",
  texto: "Texto",
};

export type TranscriptStatus =
  | "not_applicable"
  | "pending"
  | "done"
  | "unavailable"
  | "error";

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
  transcript: string | null;
  transcriptStatus: TranscriptStatus;
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
  transcript?: string | null;
  transcriptStatus?: TranscriptStatus;
  recordedAt: string;
};
