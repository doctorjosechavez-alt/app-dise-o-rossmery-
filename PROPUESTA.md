# Estudio de Obra — estado del proyecto

App móvil (Expo/React Native) para uso personal de una diseñadora de
interiores, offline-first. Este documento describe la estructura, el
modelo de datos y qué hay construido hasta ahora.

## Estado actual

**Los 6 módulos del pedido original están 100% construidos**: Clientes,
Pinturas, Materiales y acabados, Notas de campo (foto/video/voz/texto),
Pendientes (con calendario nativo + notificación local), y Medidas
estándar (biblioteca poblada + buscador). Cada uno con listar, crear,
ver/editar y eliminar donde aplica.

Verificado de verdad, no solo escrito: `tsc` y `eslint` limpios, y el
bundle completo de Metro exporta sin errores — **1054 módulos**, incluyendo
`@react-native-community/datetimepicker` y `expo-notifications`.

Además: botón para guardar fotos/videos de notas de campo en la galería,
y notificaciones locales para pendientes con fecha. Los catálogos de
`areas.ts` y `standardMeasures.ts` quedaron confirmados sin cambios.

- Navegación con expo-router (`app/`), con la ficha de cada cliente como
  "hub" hacia sus 4 módulos (con conteo real de cada uno).
- Fuentes reales Fraunces + Source Serif 4 (instancias estáticas generadas
  a partir de las variables de Google Fonts, licencia OFL incluida en
  `assets/fonts/licenses/`).
- Base de datos: migraciones y seeds (áreas + medidas estándar) corriendo
  de verdad al iniciar la app (`app/_layout.tsx` → `initDb()`).
- Kit de componentes compartidos (`src/components/`): botones grandes,
  campos de texto, cards, badge de estado — con la paleta y tipografía ya
  aplicadas.

## Cómo probarla

```bash
npm install
npx expo start
```

Se prueba con la app **Expo Go** (gratis, App Store) escaneando el código
QR — no hace falta cuenta de Apple Developer ni compilar nada. Usa Node
18 o 20 para los comandos de Expo (Node 22 funciona pero es menos
probado por el propio Expo).

Todos los módulos nativos que usa la app (cámara, calendario,
notificaciones locales, galería, selector de fecha, base de datos) vienen
incluidos en Expo Go — no hay ningún módulo de terceros que requiera un
*development build* propio.

## Los 6 módulos

1. **Clientes** — ficha por cliente (nombre, dirección de obra, contacto,
   notas, estado del proyecto). Punto de entrada a todo lo demás.
2. **Pinturas** — por cliente y área (catálogo fijo, no texto libre):
   marca, código de color, nombre, acabado, nota. Filtro por área en la
   lista.
3. **Materiales y acabados** — por cliente: tipo (tela, piso, madera,
   mármol/piedra, mueble, otro), referencia, proveedor, detalle libre.
   Filtro por tipo en la lista.
4. **Notas de campo** — foto, video, nota de voz o texto. Ver detalle de
   la grabación más abajo.
5. **Pendientes** — título, detalle, prioridad (alta/media/baja), fecha
   opcional. Al ponerle fecha pasan dos cosas: se crea un evento real en
   el calendario nativo del teléfono (Android: en un calendario local
   llamado "Estudio de Obra"; iOS: en el calendario por defecto) **y** se
   programa una notificación local para esa fecha/hora (🔔 junto al
   pendiente en la lista cuando la tiene). Si lo marcas como hecho antes
   de la fecha, la notificación se cancela sola — no te va a recordar algo
   que ya hiciste. Marcar como hecho los deja abajo de la lista; se pueden
   archivar.
6. **Medidas estándar** — ~34 medidas de referencia (tomacorrientes,
   mesones, lavamanos, barras de cortina, lámparas, manijas, clósets,
   muebles…) con buscador por palabra clave (`app/measures.tsx`, acceso
   desde la lista de clientes). Búsqueda sin distinguir acentos ("meson"
   encuentra "mesón"). No editable desde la app, como pediste.

## Cómo funciona la grabación de notas de voz

- Se graba con `expo-av` (`src/features/fieldNotes/useVoiceRecorder.ts`)
  — sin transcripción automática. Se probó y se descartó a propósito: la
  transcripción on-device (`expo-speech-recognition`) requería un
  *development build* con cuenta de Apple Developer para poder probar la
  app en iPhone, así que se priorizó poder usarla ya mismo con Expo Go.
  Si más adelante quieres retomarla (por ejemplo cuando ya tengas cuenta
  de Apple Developer por otra razón), el historial de commits del
  proyecto tiene la implementación completa como referencia.
- El archivo de audio queda guardado en el almacenamiento propio de la
  app (`FileSystem.documentDirectory/field-notes/`), funciona 100%
  offline, y se reproduce directo desde la ficha de la nota. La
  descripción de la nota se escribe a mano.
- **Fotos y video**: se capturan con una pantalla de cámara propia
  (`expo-camera`, `app/clients/[id]/notes/camera.tsx`) y se guardan
  también en el almacenamiento propio de la app. Desde la ficha de la
  nota hay un botón "Guardar en galería" para copiarlas también a Fotos
  del teléfono (útil para compartirlas directo con un contratista) — pide
  el permiso de galería solo cuando lo tocas, no antes.

## Notificaciones para pendientes

Además del evento en el calendario, cada pendiente con fecha programa una
notificación local (`src/services/notifications.ts`, `expo-notifications`)
que se dispara en el propio teléfono a la fecha/hora exacta — no depende
de internet ni de un servidor. Si cambias la fecha del pendiente, la
notificación se reprograma; si le quitas la fecha, se cancela; si lo
marcas como hecho, también se cancela sola; si lo eliminas, igual.

## Estructura de carpetas

```
.
  app.json                # config de Expo (permisos + plugins nativos)
  package.json
  tsconfig.json
  babel.config.js
  eslint.config.js
  app/                     # rutas de expo-router
    _layout.tsx            # carga fuentes + DB, navegación raíz
    index.tsx              # lista de clientes
    measures.tsx            # buscador de medidas estándar
    clients/
      new.tsx              # crear cliente (modal)
      [id]/
        index.tsx           # ficha de cliente — hub hacia los 4 módulos
        paints/              # lista (filtro por área) · new · [paintId]
        materials/            # lista (filtro por tipo) · new · [materialId]
        tasks/                  # lista (con archivadas) · new · [taskId]
        notes/
          index.tsx            # lista (filtro por tipo)
          new.tsx               # elegir: foto / video / voz / texto
          camera.tsx            # captura de foto/video (pantalla completa)
          record.tsx            # grabación de voz
          save.tsx              # completar área + descripción y guardar
          [noteId].tsx           # ver/reproducir/editar/eliminar
  assets/
    fonts/                 # Fraunces + Source Serif 4 (.ttf reales) + licencias
    images/
  src/
    db/
      migrations/
        001_init.ts        # esquema completo, ver abajo
        002_add_task_notifications.ts
      seed/
        areas.ts           # catálogo fijo de áreas
        standardMeasures.ts # catálogo fijo de medidas estándar
      client.ts             # apertura de la DB + runner de migraciones/seeds
      uuid.ts
    theme/                  # colores, tipografía, espaciado
    features/                # un módulo por dominio
      clients/, areas/, paints/, materials/, tasks/, fieldNotes/,
      standardMeasures/
    components/              # UI compartida: Button, Card, TextField,
                              # StatusBadge, ScreenContainer
    services/                 # wrappers de APIs nativas:
                               #   calendar.ts (expo-calendar)
                               #   notifications.ts (expo-notifications)
                               #   fileStorage.ts (expo-file-system /
                               #                    expo-media-library)
    hooks/
    utils/
```

**Por qué así:** cada módulo de negocio (`features/*`) es dueño de su
repositorio de datos, tipos y formularios — así se puede tocar
"Pendientes" sin arriesgar "Pinturas". `db/` es la única capa que sabe que
existe SQLite; si más adelante se conecta Supabase/Firebase, se reemplaza
o envuelve ahí adentro y las pantallas no cambian.

## Modelo de datos (SQLite — `src/db/migrations/001_init.ts`)

7 tablas:

1. **`clients`** — ficha del cliente/proyecto: nombre, dirección de obra,
   contacto, notas, `status` (cotizacion / en_obra / entregado / pausado /
   cancelado). Todo lo demás cuelga de `client_id`.
2. **`areas`** — catálogo fijo (24 áreas típicas de vivienda: Sala,
   Cocina, Baño principal, Terraza, etc.). Se usa como lista de selección
   en pinturas y notas de campo. Si falta alguna área que uses seguido,
   dímelo y la agrego a `src/db/seed/areas.ts`.
3. **`paints`** — pinturas por cliente y `area_id`: marca, código de
   color, nombre de color, acabado, nota.
4. **`standard_measures`** — biblioteca fija de ~34 medidas estándar
   (categoría, ítem, valor en texto tipo "105–110 cm", más min/max
   numérico opcional para poder ordenar), ya poblada. Son valores de
   referencia general de la industria, no normativa oficial de ningún
   país — conviene que los revises y me digas qué agregar, quitar o
   ajustar.
5. **`materials`** — materiales/acabados por cliente: tipo (tela, piso,
   madera, mármol/piedra, mueble, otro), referencia, proveedor, detalle
   libre.
6. **`field_notes`** — notas de campo: tipo (foto/video/voz/texto),
   `area_id` (opcional — una nota puede ser general), `file_uri` (archivo
   guardado en el almacenamiento propio de la app), `media_library_id`
   opcional si además se copia a la galería, descripción corta, fecha del
   recorrido. La tabla conserva columnas `transcript`/`transcript_status`
   sin usar (para una eventual transcripción automática más adelante),
   pero la app ya no las escribe.
7. **`tasks`** — pendientes: prioridad (alta/media/baja), fecha,
   `done`/`archived`, `calendar_event_id` para poder editar o borrar el
   evento del calendario nativo, y `notification_id` (agregado en
   `002_add_task_notifications.ts`) para poder cancelar/reprogramar la
   notificación local.

IDs son `TEXT` (UUID v4, generado con `expo-crypto`), no autoincrement —
pensando en que el día de mañana se sincronice entre dispositivos, un ID
generado en el teléfono no choca con el de otro.

## Otras notas de viabilidad técnica

- **Fotos/videos:** se guardan primero en el almacenamiento propio de la
  app (`expo-file-system`, funciona 100% offline); opcionalmente también
  en la galería (ver arriba).
- **Calendario nativo:** `expo-calendar` crea/edita/borra eventos reales
  (no un link). En Android crea un calendario local dedicado "Estudio de
  Obra" la primera vez que se usa, para no mezclar con el calendario
  personal.
- **Notificaciones:** son locales (programadas en el teléfono), no push
  de servidor — no necesitan backend ni cuenta, coherente con que toda la
  app es offline-first.

## Siguiente paso

Los 6 módulos del pedido original están completos, con catálogos
confirmados, guardado en galería y notificaciones de pendientes ya
agregados. No queda ningún pendiente conocido de este pedido — el resto
es lo que surja cuando la uses en obra.
