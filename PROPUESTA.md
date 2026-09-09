# Estudio de Obra — estado del proyecto

App móvil (Expo/React Native) para uso personal de una diseñadora de
interiores, offline-first. Este documento describe la estructura, el
modelo de datos y qué hay construido hasta ahora.

## Estado actual

**Los 6 módulos del pedido original están 100% construidos**: Clientes,
Pinturas, Materiales y acabados, Notas de campo (foto/video/voz con
transcripción/texto), Pendientes (con calendario nativo), y Medidas
estándar (biblioteca poblada + buscador). Cada uno con listar, crear,
ver/editar y eliminar donde aplica.

Verificado de verdad, no solo escrito: `tsc` y `eslint` limpios, y el
bundle completo de Metro exporta sin errores — **924 módulos**, incluyendo
`expo-speech-recognition` y `@react-native-community/datetimepicker`.

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

## ⚠️ Importante: esta app ya NO se puede probar con Expo Go

Con el módulo de transcripción de voz (`expo-speech-recognition`) la app
pasó a depender de un módulo nativo de terceros que **no viene incluido
en la app Expo Go**. A partir de ahora hace falta un *development build*
propio — no es mucho más complicado, pero es un paso extra la primera vez:

```bash
npm install
npx expo prebuild        # genera las carpetas ios/ y android/
npx expo run:ios         # o: npx expo run:android
```

Esto instala una app propia (con ícono "Estudio de Obra") en el
simulador o en tu teléfono conectado por cable. Después del primer build,
`npx expo start` funciona normal para seguir desarrollando (recarga en
caliente) — el paso de `run:ios`/`run:android` solo hace falta de nuevo si
se agrega otro módulo nativo nuevo. También se puede generar el build en
la nube con **EAS Build** (`eas build --profile development`) si no
quieres compilar en tu máquina.

Usa Node 18 o 20 para los comandos de Expo (Node 22 funciona pero es
menos probado por el propio Expo).

## Los 6 módulos

1. **Clientes** — ficha por cliente (nombre, dirección de obra, contacto,
   notas, estado del proyecto). Punto de entrada a todo lo demás.
2. **Pinturas** — por cliente y área (catálogo fijo, no texto libre):
   marca, código de color, nombre, acabado, nota. Filtro por área en la
   lista.
3. **Materiales y acabados** — por cliente: tipo (tela, piso, madera,
   mármol/piedra, mueble, otro), referencia, proveedor, detalle libre.
   Filtro por tipo en la lista.
4. **Notas de campo** — foto, video, nota de voz (con transcripción
   automática) o texto. Ver detalle de la arquitectura de grabación más
   abajo.
5. **Pendientes** — título, detalle, prioridad (alta/media/baja), fecha
   opcional. Al ponerle fecha, se crea un evento real en el calendario
   nativo del teléfono (Android: en un calendario local llamado "Estudio
   de Obra"; iOS: en el calendario por defecto). Marcar como hecho las deja
   abajo de la lista; se pueden archivar.
6. **Medidas estándar** — ~34 medidas de referencia (tomacorrientes,
   mesones, lavamanos, barras de cortina, lámparas, manijas, clósets,
   muebles…) con buscador por palabra clave (`app/measures.tsx`, acceso
   desde la lista de clientes). Búsqueda sin distinguir acentos ("meson"
   encuentra "mesón"). No editable desde la app, como pediste.

## Cómo funciona la grabación de notas de voz (lo más delicado de la app)

Esto es lo único de la app que no pude probar en un teléfono real desde
aquí — vale la pena que lo pruebes temprano. Así quedó diseñado:

- **Grabar SIEMPRE funciona**, tenga o no el teléfono soporte de
  transcripción — eso era un requisito explícito tuyo y no quise
  arriesgarlo.
- Al tocar "Grabar" (`src/features/fieldNotes/useVoiceRecorder.ts`), la
  app revisa si el teléfono soporta reconocimiento de voz **on-device**.
  - **Si sí**: graba y transcribe al mismo tiempo con
    `expo-speech-recognition` (un solo motor nativo hace ambas cosas — así
    se evita cualquier problema de formato de audio incompatible entre
    "grabar" y "transcribir" por separado). Se ve el texto transcribiéndose
    en vivo mientras hablas.
  - **Si no**: graba con `expo-av` normal, sin transcripción
    (`transcript_status = 'unavailable'`) — la ficha de la nota muestra el
    campo de descripción manual como respaldo.
- El archivo de audio queda guardado en el almacenamiento propio de la
  app (`FileSystem.documentDirectory/field-notes/`), funciona 100%
  offline, y se reproduce directo desde la ficha de la nota.
- **Fotos y video**: se capturan con una pantalla de cámara propia
  (`expo-camera`, `app/clients/[id]/notes/camera.tsx`) y se guardan
  también en el almacenamiento propio de la app.

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
          record.tsx            # grabación de voz (con transcripción en vivo)
          save.tsx              # completar área + descripción y guardar
          [noteId].tsx           # ver/reproducir/editar/eliminar
  assets/
    fonts/                 # Fraunces + Source Serif 4 (.ttf reales) + licencias
    images/
  src/
    db/
      migrations/
        001_init.ts        # esquema completo, ver abajo
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
   opcional si además se copia a la galería, `transcript` +
   `transcript_status`, descripción corta, fecha del recorrido.
7. **`tasks`** — pendientes: prioridad (alta/media/baja), fecha,
   `done`/`archived`, y `calendar_event_id` para poder editar o borrar el
   evento que se creó en el calendario nativo del teléfono.

IDs son `TEXT` (UUID v4, generado con `expo-crypto`), no autoincrement —
pensando en que el día de mañana se sincronice entre dispositivos, un ID
generado en el teléfono no choca con el de otro.

## Otras notas de viabilidad técnica

- **Fotos/videos:** se guardan primero en el almacenamiento propio de la
  app (`expo-file-system`, funciona 100% offline). El servicio
  `src/services/fileStorage.ts` también tiene `saveToGallery()` para
  copiarlos a la galería del teléfono si se quiere habilitar ese botón más
  adelante (para compartir directo desde Fotos con un contratista) — no
  está conectado a la UI todavía, para no pedir el permiso de galería sin
  que la usuaria lo use.
- **Calendario nativo:** `expo-calendar` crea/edita/borra eventos reales
  (no un link). En Android crea un calendario local dedicado "Estudio de
  Obra" la primera vez que se usa, para no mezclar con el calendario
  personal.

## Siguiente paso

Los 6 módulos del pedido original ya están completos. Lo que queda es
afinar, no construir:

1. Que confirmes/ajustes la lista de `standardMeasures.ts` y el catálogo
   de `areas.ts`.
2. Probar en un teléfono real el flujo de notas de voz (grabar +
   transcripción) — es la parte más delicada y la que no pude probar desde
   aquí.
3. Ideas para después, si las quieres: botón "Guardar en galería" en las
   notas de foto/video (el servicio ya existe, `saveToGallery()`, solo
   falta el botón), y notificaciones push para pendientes con fecha
   próxima (hoy dependes de revisar la lista).
