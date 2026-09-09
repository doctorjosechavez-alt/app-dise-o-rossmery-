# Estudio de Obra — estado del proyecto

App móvil (Expo/React Native) para uso personal de una diseñadora de
interiores, offline-first. Este documento describe la estructura, el
modelo de datos y qué hay construido hasta ahora.

## Estado actual

Ya está construido y probado (compila con `tsc`, pasa `eslint`, y el bundle
completo de Metro exporta sin errores — 842 módulos, incluyendo fuentes):

- Navegación con expo-router (`app/`).
- Fuentes reales Fraunces + Source Serif 4 (instancias estáticas generadas
  a partir de las variables de Google Fonts, licencia OFL incluida en
  `assets/fonts/licenses/`).
- Base de datos: migraciones y seeds (áreas + medidas estándar) corriendo
  de verdad al iniciar la app (`app/_layout.tsx` → `initDb()`).
- **Módulo de Clientes completo**: listar, crear, ver ficha, editar,
  eliminar. La ficha de cada cliente ya muestra los 4 espacios donde va a
  colgar el resto ("Pinturas", "Materiales y acabados", "Notas de campo",
  "Pendientes"), marcados como "Próximamente" — son el siguiente paso.
- Kit de componentes compartidos (`src/components/`): botones grandes,
  campos de texto, cards, badge de estado — con la paleta y tipografía ya
  aplicadas.

**Para probarla:** `npm install && npx expo start`.
Usa Node 18 o 20 (Expo recomienda LTS activo; Node 22 funciona igual una
vez corregido el detalle de `app.json` de abajo, pero LTS es lo más
probado).

**Nota técnica ya resuelta:** `expo-sqlite` no tiene config plugin propio
(no necesita configuración nativa además de los permisos ya declarados),
así que no debe listarse en `app.json → plugins` — tenerlo ahí rompía la
resolución de módulos de la CLI de Expo. Ya está corregido.

## Siguiente paso

Construir los 4 módulos restantes (Pinturas, Materiales, Notas de campo,
Pendientes) con el mismo patrón que Clientes: `types.ts` +
`*.repository.ts` + pantallas en `app/clients/[id]/...`, y reemplazar los
bloques "Próximamente" de la ficha de cliente por accesos reales.

## Estructura de carpetas

```
.
  app.json                # config de Expo (permisos cámara/mic/calendario)
  package.json
  tsconfig.json
  babel.config.js
  eslint.config.js
  app/                     # rutas de expo-router
    _layout.tsx            # carga fuentes + DB, navegación raíz
    index.tsx              # lista de clientes
    clients/
      new.tsx              # crear cliente (modal)
      [id].tsx              # ficha de cliente (ver/editar/eliminar)
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
    theme/
      colors.ts             # #FAF7F1, #2A2823, #A85C3B, #34556B
      typography.ts         # Fraunces (títulos) / Source Serif 4 (cuerpo)
      spacing.ts
    features/                # un módulo por dominio, cada uno con su
      clients/               # repositorio de datos + tipos + formulario (✅)
      paints/                 # (pendiente)
      materials/               # (pendiente)
      standardMeasures/         # (pendiente)
      fieldNotes/                # (pendiente)
      tasks/                      # (pendiente)
    components/              # UI compartida: Button, Card, TextField,
                              # StatusBadge, ScreenContainer
    services/                 # wrappers de APIs nativas:
                               #   transcription.ts (contrato ya escrito)
                               #   camera.ts, audio.ts, calendar.ts,
                               #   fileStorage.ts (pendientes)
    hooks/
    utils/
```

**Por qué así:** cada módulo de negocio (`features/*`) es dueño de su
repositorio de datos, tipos y pantallas — así se puede tocar "Pendientes"
sin arriesgar "Pinturas". `db/` es la única capa que sabe que existe SQLite;
si más adelante se conecta Supabase/Firebase, se reemplaza o envuelve ahí
adentro y las pantallas no cambian.

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
   numérico opcional para poder ordenar), ya poblada en
   `src/db/seed/standardMeasures.ts`. Son valores de referencia general de
   la industria, no normativa oficial de ningún país — conviene que los
   revises y me digas qué agregar, quitar o ajustar.
5. **`materials`** — materiales/acabados por cliente: tipo (tela, piso,
   madera, mármol/piedra, mueble, otro), referencia, proveedor, detalle
   libre.
6. **`field_notes`** — notas de campo: tipo (foto/video/voz/texto),
   `area_id` (opcional — una nota puede ser general), `file_uri` (archivo
   guardado en el almacenamiento propio de la app, para que funcione sin
   conexión), `media_library_id` opcional si además se copia a la galería,
   `transcript` + `transcript_status` (ver transcripción abajo),
   descripción corta, fecha del recorrido.
7. **`tasks`** — pendientes: prioridad (alta/media/baja), fecha,
   `done`/`archived`, y `calendar_event_id` para poder editar o borrar el
   evento que se creó en el calendario nativo del teléfono.

IDs son `TEXT` (UUID v4, generado con `expo-crypto`), no autoincrement —
pensando en que el día de mañana se sincronice entre dispositivos, un ID
generado en el teléfono no choca con el de otro.

## Transcripción automática de voz — cómo va a funcionar

Se usa reconocimiento de voz **en el propio dispositivo** (librería
`expo-speech-recognition`), no un servicio en la nube — así se mantiene
offline:

- **iPhone:** usa el dictado nativo de iOS en modo *on-device*. Funciona
  sin internet si el idioma español está descargado en Ajustes (lo cual es
  el caso por defecto en la inmensa mayoría de iPhones en español). Calidad
  buena para notas cortas tipo "medida muro cocina, 3.20 metros".
- **Android:** depende de si el teléfono tiene instalado el paquete de
  reconocimiento de voz offline para español (se configura una vez en
  Ajustes del sistema). Si no lo tiene y no hay señal, la transcripción
  simplemente no se puede hacer en ese momento.

Por eso el flujo es "mejor esfuerzo, nunca bloqueante":

1. Se graba la nota de voz normalmente y se guarda de inmediato
   (`transcript_status = 'pending'`) — grabar nunca depende de la
   transcripción.
2. En segundo plano se intenta transcribir on-device.
3. Si funciona → el texto queda guardado y es buscable
   (`transcript_status = 'done'`).
4. Si el teléfono no soporta reconocimiento offline en ese momento → queda
   `transcript_status = 'unavailable'` y la ficha de la nota simplemente
   muestra el campo de descripción manual como respaldo — nunca deja a la
   usuaria bloqueada en obra sin señal.

El contrato de esta función ya está escrito en
`src/services/transcription.ts`; la implementación con la librería nativa
se conecta junto con la pantalla de notas de campo (siguiente módulo).

## Otras notas de viabilidad técnica

- **Fotos/videos:** se graban con `expo-camera` y se guardan primero en el
  almacenamiento propio de la app (`expo-file-system`, funciona 100%
  offline). Opcionalmente, y solo si el teléfono tiene el permiso dado, se
  copian también a la galería (`expo-media-library`) para que la usuaria
  pueda compartirlos directo desde Fotos con un contratista.
- **Calendario nativo:** `expo-calendar` sí permite crear/editar/borrar
  eventos reales en el calendario del teléfono (no un link). Se guarda el
  `calendar_event_id` en `tasks` para poder mantenerlo sincronizado si la
  fecha del pendiente cambia.
