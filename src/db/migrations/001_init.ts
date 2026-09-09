// 001_init — esquema inicial. SQLite (expo-sqlite). Todo el uso es 100%
// local / offline.
//
// Convenciones:
//   * IDs: TEXT (UUID v4, generado en la app) — evita depender de
//     autoincrement al sincronizar en el futuro con Supabase/Firebase.
//   * Fechas: TEXT en formato ISO 8601 ("2026-09-09T14:30:00.000Z").
//   * Booleanos: INTEGER (0/1).
//   * created_at / updated_at en todas las tablas de usuario, para poder
//     ordenar y (más adelante) sincronizar por "última modificación".
//
// Se guarda como módulo TS (no .sql suelto) para que Metro lo empaquete
// como texto sin necesitar un transformer de assets aparte. Una vez
// aplicada en un dispositivo real, este archivo no se edita más — los
// cambios de esquema futuros van en 002_*.ts, 003_*.ts, etc.

export const MIGRATION_001_INIT = `
PRAGMA foreign_keys = ON;

-- ─────────────────────────────────────────────────────────────────────────
-- 1. CLIENTES / PROYECTOS
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE clients (
  id            TEXT PRIMARY KEY NOT NULL,
  name          TEXT NOT NULL,
  site_address  TEXT,
  contact_name  TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  general_notes TEXT,
  status        TEXT NOT NULL DEFAULT 'cotizacion'
                CHECK (status IN ('cotizacion', 'en_obra', 'entregado', 'pausado', 'cancelado')),
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE INDEX idx_clients_status ON clients(status);

-- ─────────────────────────────────────────────────────────────────────────
-- 1b. ÁREAS (catálogo fijo, igual que standard_measures — no editable por
--     la usuaria, se puebla una sola vez desde src/db/seed/areas.ts).
--     Se usa como lista de selección en pinturas y notas de campo, para
--     poder filtrar de forma consistente en vez de texto libre.
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE areas (
  id           TEXT PRIMARY KEY NOT NULL,
  name         TEXT NOT NULL UNIQUE,  -- ej. "Cocina", "Baño principal"
  sort_order   INTEGER NOT NULL DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. PINTURAS (por cliente y área)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE paints (
  id          TEXT PRIMARY KEY NOT NULL,
  client_id   TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  area_id     TEXT NOT NULL REFERENCES areas(id),
  brand       TEXT,
  color_code  TEXT,
  color_name  TEXT,
  finish      TEXT,                    -- ej. "mate", "satinado", "semi-mate", "brillante"
  note        TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX idx_paints_client   ON paints(client_id);
CREATE INDEX idx_paints_area     ON paints(client_id, area_id);

-- ─────────────────────────────────────────────────────────────────────────
-- 3. MEDIDAS ESTÁNDAR (biblioteca fija de referencia, no editable por la
--    usuaria — se puebla una sola vez desde src/db/seed/standardMeasures.ts)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE standard_measures (
  id           TEXT PRIMARY KEY NOT NULL,
  category     TEXT NOT NULL,     -- ej. "Tomacorrientes", "Mesones de cocina"
  item         TEXT NOT NULL,     -- ej. "Altura de tomacorriente sobre mesón"
  value_text   TEXT NOT NULL,     -- ej. "105–110 cm desde el piso"
  value_min_cm REAL,              -- opcional, para poder ordenar/filtrar numéricamente
  value_max_cm REAL,
  notes        TEXT
);

CREATE INDEX idx_standard_measures_category ON standard_measures(category);
-- Búsqueda simple por palabra clave (LIKE) sobre category + item + notes;
-- si la lista crece mucho, migrar a FTS5 (CREATE VIRTUAL TABLE ... USING fts5).

-- ─────────────────────────────────────────────────────────────────────────
-- 4. MATERIALES Y ACABADOS (por cliente)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE materials (
  id             TEXT PRIMARY KEY NOT NULL,
  client_id      TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  type           TEXT NOT NULL
                 CHECK (type IN ('tela', 'piso', 'madera', 'marmol_piedra', 'mueble', 'otro')),
  name_reference TEXT NOT NULL,
  supplier       TEXT,
  detail         TEXT,           -- libre: metraje, precio, link de compra, etc.
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

CREATE INDEX idx_materials_client ON materials(client_id);
CREATE INDEX idx_materials_type   ON materials(client_id, type);

-- ─────────────────────────────────────────────────────────────────────────
-- 5. NOTAS DE CAMPO (foto / video / voz / texto)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE field_notes (
  id                TEXT PRIMARY KEY NOT NULL,
  client_id         TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  area_id           TEXT REFERENCES areas(id),   -- nullable: una nota puede ser general
  type              TEXT NOT NULL CHECK (type IN ('foto', 'video', 'voz', 'texto')),
  file_uri          TEXT,          -- URI local (document directory de la app); NULL si type = 'texto'
  media_library_id  TEXT,          -- id en expo-media-library, si además se guardó en la galería
  duration_seconds  REAL,          -- solo video/voz
  description       TEXT,          -- descripción corta de qué muestra (escrita o copiada del transcript)
  transcript        TEXT,          -- texto transcrito automáticamente (solo type = 'voz' o 'video')
  transcript_status TEXT NOT NULL DEFAULT 'not_applicable'
                    CHECK (transcript_status IN (
                      'not_applicable', -- type = 'foto' o 'texto'
                      'pending',        -- transcripción on-device en curso
                      'done',
                      'unavailable',    -- el dispositivo no soporta reconocimiento offline en este idioma
                      'error'
                    )),
  recorded_at       TEXT NOT NULL, -- fecha del recorrido/registro (puede diferir de created_at)
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX idx_field_notes_client ON field_notes(client_id);
CREATE INDEX idx_field_notes_type   ON field_notes(client_id, type);
-- Búsqueda por palabra clave sobre description + transcript (LIKE); si la
-- cantidad de notas crece mucho, migrar a FTS5.

-- ─────────────────────────────────────────────────────────────────────────
-- 6. PENDIENTES (con recordatorio en calendario nativo)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE tasks (
  id                TEXT PRIMARY KEY NOT NULL,
  client_id         TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  priority          TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  due_date          TEXT,           -- fecha (+ hora opcional) del pendiente; NULL = sin fecha
  done              INTEGER NOT NULL DEFAULT 0,
  done_at           TEXT,
  archived          INTEGER NOT NULL DEFAULT 0,
  calendar_event_id TEXT,           -- id devuelto por expo-calendar, para poder editar/borrar el evento
  created_at        TEXT NOT NULL,
  updated_at        TEXT NOT NULL
);

CREATE INDEX idx_tasks_client   ON tasks(client_id);
CREATE INDEX idx_tasks_pending  ON tasks(client_id, done, archived, due_date);
`;
