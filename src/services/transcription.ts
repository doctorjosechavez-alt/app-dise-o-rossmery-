// Transcripción automática de notas de voz/video, en el dispositivo
// (offline cuando el teléfono lo soporta), usando expo-speech-recognition.
//
// Cómo funciona en cada plataforma:
//   - iOS: SFSpeechRecognizer con `requiresOnDeviceRecognition: true`.
//     Funciona sin internet si el idioma (es-*) está descargado en
//     Ajustes > General > Teclado > Dictado, lo cual es el caso por
//     defecto en la mayoría de iPhones configurados en español.
//   - Android: SpeechRecognizer con `EXTRA_PREFER_OFFLINE`. Depende del
//     modelo de reconocimiento de voz offline instalado en el teléfono
//     (Ajustes > Sistema > Idiomas > Reconocimiento de voz); si no está
//     disponible, cae a reconocimiento en línea (requiere conexión) o
//     directamente falla.
//
// En ambos casos esto es "mejor esfuerzo": si el dispositivo no tiene el
// paquete de idioma offline y no hay conexión, la transcripción no se
// puede hacer. Por eso field_notes.transcript_status existe — para que la
// UI pueda mostrar "Transcripción no disponible" y dejar el campo de
// descripción manual como respaldo, en vez de bloquear el guardado de la
// nota.
//
// Flujo:
//   1. Se graba la nota de voz/video normalmente (services/audio.ts,
//      services/camera.ts) y se guarda de inmediato con
//      transcript_status = 'pending'.
//   2. En segundo plano se intenta transcribir con reconocimiento on-device.
//   3. Si funciona → transcript_status = 'done', se guarda el texto.
//      Si el dispositivo no soporta reconocimiento offline en este idioma
//      → transcript_status = 'unavailable'.
//      Si falla por otra razón → transcript_status = 'error' (se puede
//      reintentar manualmente desde la ficha de la nota).
//
// La implementación real (llamadas a expo-speech-recognition) se agrega
// junto con la pantalla de notas de campo; este archivo documenta el
// contrato para que el resto de la app no dependa de la librería
// específica.

export type TranscriptionResult =
  | { status: "done"; text: string }
  | { status: "unavailable"; reason: string }
  | { status: "error"; reason: string };

export async function transcribeAudioFile(
  fileUri: string,
  locale: string = "es-ES"
): Promise<TranscriptionResult> {
  throw new Error("not implemented yet — se implementa junto con fieldNotes");
}
