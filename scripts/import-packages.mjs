import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { importPrepared, validatePrepared } from "../server/crawler/import.js";

let pool;
try {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      "dry-run": { type: "boolean", default: false },
      help: { type: "boolean" },
    },
  });
  if (values.help)
    console.log(
      "npm run packages:import -- --input codex/crawl-data/prepared.json [--dry-run]\n從 .env 讀取資料庫設定；dry-run 只預覽新增與更新筆數。",
    );
  else {
    if (!values.input) throw new Error("請用 --input 指定已整理的檔案");
    const report = JSON.parse(await readFile(values.input, "utf8"));
    validatePrepared(report);
    ({ pool } = await import("../server/db.js"));
    const result = await importPrepared(pool, report, {
      dryRun: values["dry-run"],
    });
    console.log(
      `${result.dryRun ? "預覽" : "匯入完成"}：新增 ${result.inserted} 筆、更新 ${result.updated} 筆。既有收藏與討論關聯保留。`,
    );
  }
} catch (error) {
  console.error("匯入失敗：", error.code || error.message);
  process.exitCode = 1;
} finally {
  if (pool) await pool.end();
}
