import mysql from "mysql2/promise";
import { pathToFileURL } from "node:url";
import { connectionOptions, database, pool } from "./db.js";
import { catalog, categories, starterTopics } from "./catalog.js";
import { ensureToolboxSchema } from "./toolbox-schema.js";

export async function setup() {
  const connection = await mysql.createConnection(connectionOptions);
  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await connection.end();
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, username VARCHAR(30) NOT NULL UNIQUE, email VARCHAR(254) NOT NULL UNIQUE, password_hash VARCHAR(255) NOT NULL, role VARCHAR(20) NOT NULL DEFAULT 'member', created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS categories (id VARCHAR(30) PRIMARY KEY, name VARCHAR(60) NOT NULL)`,
    `CREATE TABLE IF NOT EXISTS packages (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, slug VARCHAR(80) NOT NULL UNIQUE, name VARCHAR(150) NOT NULL, category_id VARCHAR(30) NOT NULL, publisher VARCHAR(100), summary TEXT NOT NULL, tags TEXT NOT NULL, is_free BOOLEAN NOT NULL DEFAULT 0, official_url VARCHAR(500) NOT NULL, mark VARCHAR(5), color VARCHAR(10), FOREIGN KEY (category_id) REFERENCES categories(id))`,
    `CREATE TABLE IF NOT EXISTS topics (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, seed_key VARCHAR(80) UNIQUE, user_id INT UNSIGNED NOT NULL, category_id VARCHAR(30) NOT NULL, package_id INT UNSIGNED NULL, title VARCHAR(160) NOT NULL, body TEXT NOT NULL, type VARCHAR(20) NOT NULL, tags VARCHAR(200) NOT NULL DEFAULT '', pinned BOOLEAN NOT NULL DEFAULT 0, views INT UNSIGNED NOT NULL DEFAULT 0, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, INDEX (category_id, created_at), FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (package_id) REFERENCES packages(id))`,
    `CREATE TABLE IF NOT EXISTS replies (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, topic_id INT UNSIGNED NOT NULL, user_id INT UNSIGNED NOT NULL, body TEXT NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE, FOREIGN KEY (user_id) REFERENCES users(id), INDEX (topic_id, created_at))`,
    `CREATE TABLE IF NOT EXISTS favorites (user_id INT UNSIGNED NOT NULL, package_id INT UNSIGNED NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(user_id, package_id), FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (package_id) REFERENCES packages(id) ON DELETE CASCADE)`,
    `CREATE TABLE IF NOT EXISTS sessions (sid VARCHAR(128) PRIMARY KEY, data MEDIUMTEXT NOT NULL, expires DATETIME NOT NULL, INDEX (expires))`,
  ];
  for (const sql of statements) await pool.query(sql);
  await ensureToolboxSchema(pool);
  for (const c of categories)
    await pool.execute(
      "INSERT IGNORE INTO categories (id, name) VALUES (?, ?)",
      [c.id, c.name],
    );
  for (const p of catalog)
    await pool.execute(
      "INSERT IGNORE INTO packages (slug,name,category_id,publisher,summary,tags,is_free,official_url,mark,color) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        p.slug,
        p.name,
        p.category,
        p.publisher,
        p.summary,
        JSON.stringify(p.tags),
        p.free,
        p.url,
        p.mark,
        p.color,
      ],
    );
  // An editorial identity with no usable password; no seeded public login credentials.
  await pool.execute(
    "INSERT IGNORE INTO users (username,email,password_hash,role) VALUES (?,?,?,?)",
    ["Unity 編輯室", "editor@unity-packages.invalid", "!disabled", "editor"],
  );
  const [[editor]] = await pool.execute(
    "SELECT id FROM users WHERE email = ?",
    ["editor@unity-packages.invalid"],
  );
  const [packages] = await pool.query("SELECT id, slug FROM packages");
  for (let i = 0; i < starterTopics.length; i++) {
    const t = starterTopics[i];
    await pool.execute(
      "INSERT IGNORE INTO topics (seed_key,user_id,category_id,package_id,title,body,type,tags,pinned) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        "welcome-" + i,
        editor.id,
        t.category,
        packages.find((p) => p.slug === t.packageSlug)?.id || null,
        t.title,
        t.body,
        t.type,
        t.tags || "",
        t.pinned || 0,
      ],
    );
  }
  await pool.query("DELETE FROM sessions WHERE expires < UTC_TIMESTAMP()");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await setup();
    console.log("資料表與起始內容已準備完成。");
  } catch (error) {
    console.error("資料庫初始化失敗：", error.code || error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
