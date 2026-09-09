import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";

import { newId } from "@/db/uuid";

// Almacenamiento local de fotos/videos de notas de campo. Los archivos
// viven en el directorio propio de la app (funciona 100% offline, no
// depende de permisos de galería) y opcionalmente se copian también a la
// galería del teléfono.

const FIELD_NOTES_DIR = `${FileSystem.documentDirectory}field-notes/`;

async function ensureDir(): Promise<void> {
  const info = await FileSystem.getInfoAsync(FIELD_NOTES_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(FIELD_NOTES_DIR, { intermediates: true });
  }
}

// Copia un archivo capturado (típicamente en un directorio de caché) al
// almacenamiento persistente de la app.
export async function persistMediaFile(
  sourceUri: string,
  extension: string
): Promise<string> {
  await ensureDir();
  const destUri = `${FIELD_NOTES_DIR}${newId()}.${extension}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function deleteMediaFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  } catch {
    // Ya no existía — nada que hacer.
  }
}

// Copia opcional a la galería del teléfono, para compartir directo desde
// Fotos con un contratista. Devuelve el id del asset o null si el
// permiso fue negado.
export async function saveToGallery(uri: string): Promise<string | null> {
  const { status } = await MediaLibrary.requestPermissionsAsync();
  if (status !== "granted") return null;
  const asset = await MediaLibrary.createAssetAsync(uri);
  return asset.id;
}
