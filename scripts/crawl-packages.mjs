import { parseArgs } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { crawlPackages } from "../server/crawler/crawl.js";
import { createHttpClient } from "../server/crawler/http.js";

try {
  const { values } = parseArgs({
    options: {
      source: { type: "string", default: "all" },
      "unity-version": { type: "string", default: "6000.3" },
      limit: { type: "string" },
      output: { type: "string" },
      snapshots: { type: "boolean" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      "npm run packages:crawl -- [--source all|unity|github|asset-store] [--unity-version 6000.3] [--limit 5] [--output codex/crawl-data/raw.json] [--snapshots]\n僅擷取官方公開資料，不連線至資料庫。輸出檔案必須尚未存在。",
    );
  } else {
    if (
      values.limit &&
      (!/^\d+$/.test(values.limit) || Number(values.limit) < 1)
    )
      throw new Error("limit 必須是正整數");
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const output = path.resolve(
      values.output || `codex/crawl-data/${stamp}/raw.json`,
    );
    await mkdir(path.dirname(output), { recursive: true });
    // Reserve the destination before network work, avoiding accidental overwrites.
    await writeFile(output, "", { flag: "wx" });
    const client = createHttpClient();
    if (values.snapshots) {
      const request = client.request;
      const snapshots = path.join(path.dirname(output), "responses");
      await mkdir(snapshots, { recursive: true });
      client.request = async (...args) => {
        const result = await request(...args);
        if (result)
          await writeFile(
            path.join(
              snapshots,
              createHash("sha256").update(args[0]).digest("hex").slice(0, 20) +
                ".txt",
            ),
            result.body,
          );
        return result;
      };
    }
    const report = await crawlPackages({
      source: values.source,
      unityVersion: values["unity-version"],
      limit: values.limit ? Number(values.limit) : Infinity,
      client,
      onProgress: console.log,
    });
    await writeFile(output, JSON.stringify(report, null, 2) + "\n");
    console.log(
      `擷取完成：${report.items.length} 筆，失敗 ${report.failures.length} 筆。\n原始結果：${output}\n下一步：npm run packages:prepare -- --input "${output}"`,
    );
    if (report.failures.length) process.exitCode = 2;
    if (!report.items.length) process.exitCode = 1;
  }
} catch (error) {
  console.error("擷取未完成：", error.code || error.message);
  process.exitCode = 1;
}
