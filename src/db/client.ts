import * as SQLite from "expo-sqlite";

import { MIGRATION_001_INIT } from "./migrations/001_init";
import { AREAS_SEED } from "./seed/areas";
import { STANDARD_MEASURES_SEED } from "./seed/standardMeasures";
import { newId } from "./uuid";

// Punto único de acceso a la base de datos local. Toda la capa de datos
// (repositorios en src/features/*/*.repository.ts) pasa por aquí, para que
// el día que se agregue sync remoto (Supabase/Firebase) solo haya que
// envolver o sustituir este archivo, sin tocar las pantallas.

const DB_NAME = "interior_designer.db";

let dbInstance: SQLite.SQLiteDatabase | null = null;
let readyPromise: Promise<void> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbInstance;
}

// Migraciones numeradas y ordenadas: cada entrada corre una sola vez,
// registrada en la tabla schema_migrations. Nuevos cambios de esquema se
// agregan como 002_*.ts, 003_*.ts, etc. — nunca se edita 001 una vez
// aplicada en un dispositivo real.
const MIGRATIONS: { id: string; sql: string }[] = [
  { id: "001_init", sql: MIGRATION_001_INIT },
];

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  for (const migration of MIGRATIONS) {
    const already = await db.getFirstAsync<{ id: string }>(
      "SELECT id FROM schema_migrations WHERE id = ?",
      migration.id
    );
    if (already) continue;

    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.sql);
      await db.runAsync(
        "INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)",
        migration.id,
        new Date().toISOString()
      );
    });
  }
}

async function seedAreasIfNeeded(db: SQLite.SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM areas"
  );
  if ((row?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (let i = 0; i < AREAS_SEED.length; i++) {
      await db.runAsync(
        "INSERT INTO areas (id, name, sort_order) VALUES (?, ?, ?)",
        newId(),
        AREAS_SEED[i],
        i
      );
    }
  });
}

async function seedStandardMeasuresIfNeeded(
  db: SQLite.SQLiteDatabase
): Promise<void> {
  const row = await db.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM standard_measures"
  );
  if ((row?.count ?? 0) > 0) return;

  await db.withTransactionAsync(async () => {
    for (const measure of STANDARD_MEASURES_SEED) {
      await db.runAsync(
        `INSERT INTO standard_measures
          (id, category, item, value_text, value_min_cm, value_max_cm, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        newId(),
        measure.category,
        measure.item,
        measure.valueText,
        measure.valueMinCm ?? null,
        measure.valueMaxCm ?? null,
        measure.notes ?? null
      );
    }
  });
}

// Se llama una vez al iniciar la app (ver app/_layout.tsx). Siguientes
// llamadas devuelven la misma promesa, así que es seguro invocarla desde
// varios lugares sin correr las migraciones/seeds más de una vez.
export function initDb(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      const db = await getDb();
      await runMigrations(db);
      await seedAreasIfNeeded(db);
      await seedStandardMeasuresIfNeeded(db);
    })();
  }
  return readyPromise;
}

// Usado por los repositorios de cada feature. initDb() ya se resolvió en
// el layout raíz antes de que se monten las pantallas, así que en la
// práctica esto solo abre/reusa la conexión.
export async function getReadyDb(): Promise<SQLite.SQLiteDatabase> {
  await initDb();
  return getDb();
}
