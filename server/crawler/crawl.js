import { createHttpClient } from "./http.js";
import {
  parseUnityIndex,
  parseUnityPackage,
  parseGithubRepo,
  parseAssetStore,
} from "./parsers.js";
import { githubSources, assetStoreSources, sourceTypes } from "./sources.js";

export async function crawlPackages({
  source = "all",
  unityVersion = "6000.3",
  limit = Infinity,
  client = createHttpClient(),
  onProgress = () => {},
} = {}) {
  if (!/^\d{4}\.\d+$/.test(unityVersion))
    throw new Error("Unity 文件版本格式需為 6000.3 或 2022.3");
  if (source !== "all" && !sourceTypes.includes(source))
    throw new Error("未知的擷取來源");
  const report = {
    schemaVersion: 1,
    kind: "unity-toolbox-raw",
    startedAt: new Date().toISOString(),
    unityVersion,
    sources: source === "all" ? sourceTypes : [source],
    items: [],
    failures: [],
    skipped: [],
  };
  async function collect(label, get) {
    try {
      const item = await get();
      item.fetchedAt = new Date().toISOString();
      report.items.push(item);
      onProgress(`已擷取 ${report.items.length}：${item.name}`);
    } catch (error) {
      report.failures.push({
        source: label,
        reason: error.code || "PARSE_ERROR",
        message: error.message,
      });
      onProgress(`未擷取 ${label}：${error.message}`);
    }
  }
  if (report.sources.includes("unity")) {
    const entries = new Map();
    for (const page of ["pack-safe", "pack-core"]) {
      const url = `https://docs.unity3d.com/${unityVersion}/Documentation/Manual/${page}.html`;
      try {
        const html = await client.request(url);
        for (const entry of parseUnityIndex(html.body, url))
          entries.set(entry.key, entry);
      } catch (error) {
        report.failures.push({
          source: url,
          reason: error.code || "INDEX_ERROR",
          message: error.message,
        });
      }
    }
    onProgress(`Unity 官方目錄發現 ${entries.size} 個套件`);
    for (const entry of [...entries.values()].slice(0, limit)) {
      await collect(entry.url, async () =>
        parseUnityPackage(
          (await client.request(entry.url)).body,
          entry,
          unityVersion,
        ),
      );
    }
  }
  if (report.sources.includes("github")) {
    for (const repo of githubSources.slice(0, limit)) {
      await collect(`github:${repo}`, async () => {
        const url = `https://api.github.com/repos/${repo}`;
        const data = JSON.parse((await client.request(url)).body);
        const item = parseGithubRepo(data, repo);
        if (item.status === "archived") return item;
        try {
          const response = await client.request(`${url}/releases/latest`, {
            allow404: true,
          });
          return parseGithubRepo(
            data,
            repo,
            response ? JSON.parse(response.body) : null,
          );
        } catch (error) {
          report.failures.push({
            source: `${url}/releases/latest`,
            reason: error.code || "RELEASE_ERROR",
            message: error.message,
          });
          return item; // Repository facts remain valid; no release version is fabricated.
        }
      });
    }
  }
  if (report.sources.includes("asset-store")) {
    for (const entry of assetStoreSources.slice(0, limit)) {
      await collect(entry.url, async () =>
        parseAssetStore((await client.request(entry.url)).body, entry),
      );
    }
  }
  report.finishedAt = new Date().toISOString();
  return report;
}
