import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parseArgs } from "node:util";
import { createHash } from "node:crypto";
import path from "node:path";
import { preparePackages } from "../server/crawler/prepare.js";

try {
  const { values } = parseArgs({
    options: {
      input: { type: "string", multiple: true },
      output: { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help)
    console.log(
      "npm run packages:prepare -- --input raw.json [--input retry.json] [--output prepared.json]\n依人工用途索引去重分類；新發現但尚未整理的套件列入 pendingReview，不自動匯入。",
    );
  else {
    if (!values.input?.length) throw new Error("請用 --input 指定原始擷取檔");
    const sources = [],
      reports = [];
    for (const input of values.input) {
      const raw = await readFile(input, "utf8");
      reports.push(JSON.parse(raw));
      sources.push({
        path: path.resolve(input),
        sha256: createHash("sha256").update(raw).digest("hex"),
      });
    }
    const result = { ...preparePackages(reports), inputs: sources };
    const output = path.resolve(
      values.output ||
        path.join(path.dirname(values.input[0]), "prepared.json"),
    );
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, JSON.stringify(result, null, 2) + "\n", {
      flag: "wx",
    });
    console.log(
      `整理完成：${result.items.length} 筆、排除 ${result.excluded.length} 筆、合併重複 ${result.duplicates} 筆、待人工整理 ${result.pendingReview.length} 筆、未解決來源錯誤 ${result.failures.length} 筆。\n整理檔：${output}\n下一步：npm run packages:import -- --input "${output}" --dry-run`,
    );
    if (result.pendingReview.length || result.failures.length)
      process.exitCode = 2;
  }
} catch (error) {
  console.error("整理失敗：", error.code || error.message);
  process.exitCode = 1;
}
