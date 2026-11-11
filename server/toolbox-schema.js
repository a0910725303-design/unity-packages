// Additive migration: preserve all package IDs, favorites, and discussions.
export async function ensureToolboxSchema(db) {
  const [existing] = await db.query("SHOW COLUMNS FROM packages");
  const columns = new Set(existing.map((c) => c.Field));
  const additions = {
    source_type: "VARCHAR(24) NOT NULL DEFAULT 'editorial'",
    source_key: "VARCHAR(220) NULL",
    source_url: "VARCHAR(500) NULL",
    source_version: "VARCHAR(80) NULL",
    license: "VARCHAR(100) NULL",
    editor_version: "VARCHAR(40) NULL",
    source_updated_at: "DATETIME NULL",
    crawled_at: "DATETIME NULL",
  };
  for (const [name, definition] of Object.entries(additions)) {
    if (!columns.has(name))
      await db.query(`ALTER TABLE packages ADD COLUMN ${name} ${definition}`);
  }
  if (existing.find((c) => c.Field === "is_free")?.Null !== "YES") {
    await db.query(
      "ALTER TABLE packages MODIFY COLUMN is_free BOOLEAN NULL DEFAULT NULL",
    );
  }
  const [indexes] = await db.query("SHOW INDEX FROM packages");
  if (!indexes.some((i) => i.Key_name === "packages_source_key_unique")) {
    await db.query(
      "ALTER TABLE packages ADD UNIQUE INDEX packages_source_key_unique (source_key)",
    );
  }
}
