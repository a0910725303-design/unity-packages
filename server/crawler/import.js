import { createHash } from "node:crypto";
import { ensureToolboxSchema } from "../toolbox-schema.js";
import { sourceTypes } from "./sources.js";

const categories = new Set(["tools", "animation", "art", "effects", "systems"]);
const colors = {
  tools: "#47799b",
  animation: "#b98454",
  art: "#598358",
  effects: "#8962a1",
  systems: "#468b88",
};
const date = (value) =>
  value ? new Date(value).toISOString().slice(0, 19).replace("T", " ") : null;
const optionalText = (value, max) =>
  value === null ||
  (typeof value === "string" && value.length > 0 && value.length <= max);

export function validatePrepared(report) {
  if (
    report?.schemaVersion !== 1 ||
    report.kind !== "unity-toolbox-prepared" ||
    !Array.isArray(report.items) ||
    report.items.length > 3000
  )
    throw new Error("整理檔格式不正確");
  const identities = new Set(),
    urls = new Set();
  for (const p of report.items) {
    if (
      !sourceTypes.includes(p.source) ||
      typeof p.key !== "string" ||
      !/^[a-z0-9./_-]{1,190}$/i.test(p.key)
    )
      throw new Error("套件來源識別碼不合法");
    if (
      !categories.has(p.category) ||
      !p.name ||
      !optionalText(p.name, 150) ||
      !p.summary ||
      !optionalText(p.summary, 1500) ||
      !/[\u3400-\u9fff]/u.test(p.summary)
    )
      throw new Error("套件缺少名稱、繁體中文說明或有效分類");
    if (
      !Array.isArray(p.tags) ||
      p.tags.length > 20 ||
      !p.tags.every(
        (t) => typeof t === "string" && t.length > 0 && t.length <= 60,
      )
    )
      throw new Error("套件標籤格式不正確");
    for (const [value, max] of [
      [p.publisher, 100],
      [p.version, 80],
      [p.license, 100],
      [p.editorVersion, 40],
    ]) {
      if (!optionalText(value, max))
        throw new Error("套件來源欄位長度或格式不正確");
    }
    if (![true, false, null].includes(p.isFree) || p.status !== "active")
      throw new Error("只允許匯入有效套件，且費用狀態需為已確認或未知");
    for (const value of [p.fetchedAt, p.updatedAt]) {
      if (
        value !== null &&
        (typeof value !== "string" || !Number.isFinite(Date.parse(value)))
      )
        throw new Error("套件時間格式不正確");
    }
    if (!p.fetchedAt) throw new Error("缺少擷取時間");
    for (const [field, isSource] of [
      ["officialUrl", false],
      ["sourceUrl", true],
    ]) {
      if (typeof p[field] !== "string" || p[field].length > 500)
        throw new Error("套件網址格式不正確");
      const u = new URL(p[field]);
      const host =
        p.source === "unity"
          ? "docs.unity3d.com"
          : p.source === "asset-store"
            ? "assetstore.unity.com"
            : isSource
              ? "api.github.com"
              : "github.com";
      if (
        u.protocol !== "https:" ||
        u.hostname !== host ||
        u.username ||
        u.password ||
        u.port
      )
        throw new Error("套件網址不是對應的官方來源");
      const matches =
        p.source === "unity"
          ? u.pathname.endsWith(`/${p.key}.html`)
          : p.source === "asset-store"
            ? u.pathname.match(/-(\d+)\/?$/)?.[1] === p.key
            : u.pathname.toLowerCase() ===
              `${isSource ? "/repos" : ""}/${p.key.toLowerCase()}`;
      if (!matches) throw new Error("套件網址與來源識別碼不一致");
    }
    const identity = `${p.source}:${p.key}`;
    if (identities.has(identity) || urls.has(p.officialUrl))
      throw new Error("整理檔中仍有重複套件");
    identities.add(identity);
    urls.add(p.officialUrl);
  }
  return report.items;
}

export async function importPrepared(pool, report, { dryRun = false } = {}) {
  const items = validatePrepared(report);
  const db = await pool.getConnection();
  let locked = false;
  const result = { inserted: 0, updated: 0, dryRun, total: items.length };
  try {
    const [[lock]] = await db.query(
      "SELECT GET_LOCK(CONCAT(DATABASE(), ':toolbox-import'), 0) acquired",
    );
    if (lock.acquired !== 1)
      throw new Error("另一個工具箱匯入正在執行，請稍後重試");
    locked = true;
    if (!dryRun) await ensureToolboxSchema(db);
    await db.beginTransaction();
    for (const p of items) {
      const key = `${p.source}:${p.key}`;
      const [matches] = await db.execute(
        "SELECT id, source_key FROM packages WHERE source_key=? OR official_url=?",
        [key, p.officialUrl],
      );
      if (
        matches.length > 1 ||
        (matches[0]?.source_key && matches[0].source_key !== key)
      )
        throw new Error("資料庫中有不同來源的重複網址，已取消整批匯入");
      const existing = matches[0];
      result[existing ? "updated" : "inserted"]++;
      if (dryRun) continue;
      const values = [
        p.name,
        p.category,
        p.publisher,
        p.summary,
        JSON.stringify(p.tags),
        p.isFree,
        p.officialUrl,
        p.source,
        key,
        p.sourceUrl,
        p.version,
        p.license,
        p.editorVersion,
        date(p.updatedAt),
        date(p.fetchedAt),
      ];
      if (existing) {
        // Never REPLACE: existing IDs are referenced by favorites and topics.
        await db.execute(
          `UPDATE packages SET name=?,category_id=?,publisher=?,summary=?,tags=?,is_free=?,official_url=?,source_type=?,source_key=?,source_url=?,source_version=?,license=?,editor_version=?,source_updated_at=?,crawled_at=? WHERE id=?`,
          [...values, existing.id],
        );
      } else {
        const slug = `crawl-${p.source}-${createHash("sha256").update(key).digest("hex").slice(0, 20)}`;
        const mark = p.name.replace(/[^a-z0-9]/gi, "").slice(0, 2) || "U";
        await db.execute(
          `INSERT INTO packages (name,category_id,publisher,summary,tags,is_free,official_url,source_type,source_key,source_url,source_version,license,editor_version,source_updated_at,crawled_at,slug,mark,color) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [...values, slug, mark, colors[p.category]],
        );
      }
    }
    if (dryRun) await db.rollback();
    else await db.commit();
    return result;
  } catch (error) {
    await db.rollback();
    throw error;
  } finally {
    try {
      if (locked)
        await db.query(
          "SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':toolbox-import'))",
        );
    } finally {
      db.release();
    }
  }
}
