import { getCuration, excluded } from "./curation.js";
import { validatePrepared } from "./import.js";

export function preparePackages(reports) {
  const unique = new Map(),
    urls = new Set();
  const output = {
    schemaVersion: 1,
    kind: "unity-toolbox-prepared",
    preparedAt: new Date().toISOString(),
    items: [],
    excluded: [],
    pendingReview: [],
    failures: [],
    duplicates: 0,
  };
  for (const report of reports) {
    if (
      report?.kind !== "unity-toolbox-raw" ||
      report.schemaVersion !== 1 ||
      !Array.isArray(report.items)
    )
      throw new Error("原始擷取檔格式不正確");
    output.failures.push(...report.failures);
    for (const item of report.items) {
      const identity = `${item.source}:${item.key}`;
      const old = unique.get(identity);
      if (old) output.duplicates++;
      if (!old || item.fetchedAt > old.fetchedAt) unique.set(identity, item);
    }
  }
  for (const item of unique.values()) {
    const identity = `${item.source}:${item.key}`;
    const reason =
      excluded[identity] ||
      (item.status !== "active"
        ? "來源已封存、停用或無可確認的供應狀態"
        : null);
    if (reason) {
      output.excluded.push({ identity, name: item.name, reason });
      continue;
    }
    const curation = getCuration(item);
    if (!curation) {
      output.pendingReview.push(item);
      continue;
    }
    if (urls.has(item.officialUrl)) {
      output.duplicates++;
      continue;
    }
    urls.add(item.officialUrl);
    output.items.push({ ...item, ...curation });
  }
  // Preserve only unresolved failures after merging retry snapshots.
  const succeeded = new Set([...unique.values()].map((p) => p.sourceUrl));
  output.failures = output.failures.filter(
    (f, i, all) =>
      !succeeded.has(f.source) &&
      all.findIndex((x) => x.source === f.source) === i,
  );
  validatePrepared(output);
  return output;
}
