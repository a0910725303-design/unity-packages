import { load } from "cheerio";
import { valid } from "semver";

const clean = (value, max = 600) =>
  typeof value === "string"
    ? value.replace(/\s+/g, " ").trim().slice(0, max)
    : "";
export function parseStructuredJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    // Some storefront reviews contain literal tabs/newlines inside JSON strings.
    // Escape only those invalid control characters; never execute source scripts.
    let quoted = false,
      escaped = false,
      repaired = "";
    for (const char of text) {
      if (quoted && char.charCodeAt(0) < 32) {
        repaired += `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
        continue;
      }
      repaired += char;
      if (escaped) {
        escaped = false;
        continue;
      }
      if (quoted && char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') quoted = !quoted;
    }
    return JSON.parse(repaired);
  }
}
export function parseUnityIndex(html, pageUrl) {
  const $ = load(html),
    found = new Map();
  $("li").each((_, li) => {
    const node = $(li),
      text = clean(node.text());
    const match = text.match(/^(.+?):\s*(com\.unity\.[a-z0-9._-]+)$/i);
    if (!match) return;
    const key = match[2];
    found.set(key, {
      key,
      name: match[1],
      url: new URL(`${key}.html`, pageUrl).href,
      indexUrl: pageUrl,
    });
  });
  if (found.size === 0)
    throw new Error("官方目錄格式已改變，未找到套件；請檢查解析器");
  return [...found.values()];
}

export function parseUnityPackage(html, entry, editorVersion) {
  const $ = load(html);
  $("script,style,nav,header,footer").remove();
  const title = clean($("h1").first().text(), 150);
  const body = clean($("body").text(), 100000);
  if (!title || !body.includes(entry.key))
    throw new Error("官方套件頁的識別碼不符");
  const heading = $("h2")
    .filter((_, h) => clean($(h).text()) === "Description")
    .first();
  const description = clean(heading.nextUntil("h1,h2").text());
  const version = body.match(
    /Package version ([0-9]+\.[0-9]+\.[0-9]+) is released for Unity Editor version ([0-9]+\.[0-9]+)/,
  );
  if (version && version[2] !== editorVersion)
    throw new Error("官方文件的 Unity 版本與指定版本不符");
  return {
    source: "unity",
    key: entry.key,
    name: title,
    publisher: "Unity Technologies",
    description,
    officialUrl: entry.url,
    sourceUrl: entry.url,
    indexUrl: entry.indexUrl,
    version: version && valid(version[1]) ? version[1] : null,
    editorVersion,
    license: null,
    isFree: null,
    updatedAt: null,
    status: "active",
  };
}

export function parseGithubRepo(repo, requestedRepo, release = null) {
  if (
    !repo ||
    typeof repo.full_name !== "string" ||
    repo.private ||
    !repo.owner?.login ||
    !repo.name
  )
    throw new Error("GitHub 倉庫資料不完整");
  const url = new URL(repo.html_url);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.pathname.toLowerCase() !== `/${repo.full_name.toLowerCase()}`
  )
    throw new Error("GitHub 作者來源網址不符");
  const license =
    repo.license?.spdx_id &&
    !["NOASSERTION", "NONE"].includes(repo.license.spdx_id)
      ? repo.license.spdx_id
      : null;
  const openLicenses = [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "MPL-2.0",
    "ISC",
    "Unlicense",
    "CC0-1.0",
    "Zlib",
    "LGPL-3.0",
    "GPL-3.0",
  ];
  return {
    source: "github",
    key: repo.full_name.toLowerCase(),
    requestedRepo,
    name: clean(repo.name, 150),
    publisher: clean(repo.owner.login, 100),
    description: clean(repo.description),
    officialUrl: url.href,
    sourceUrl: `https://api.github.com/repos/${repo.full_name}`,
    version:
      release && !release.prerelease && !release.draft
        ? clean(release.tag_name, 80) || null
        : null,
    editorVersion: null,
    license,
    isFree: openLicenses.includes(license) ? true : null,
    updatedAt: repo.pushed_at || null,
    status: repo.archived || repo.disabled ? "archived" : "active",
  };
}

export function parseAssetStore(html, entry) {
  const $ = load(html),
    products = [];
  function visit(value) {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    if ([value["@type"]].flat().includes("Product")) products.push(value);
    if (value["@graph"]) visit(value["@graph"]);
  }
  $("script[type='application/ld+json']").each((_, el) => {
    try {
      visit(parseStructuredJson($(el).text()));
    } catch {
      /* A malformed unrelated block must not hide valid product data. */
    }
  });
  const assetId = entry.url.match(/-(\d+)\/?$/)?.[1];
  const product = products.find((p) => {
    const offer = Array.isArray(p.offers) ? p.offers[0] : p.offers;
    try {
      const u = new URL(offer?.url || p.url);
      return (
        u.hostname === "assetstore.unity.com" &&
        u.pathname.match(/-(\d+)\/?$/)?.[1] === assetId
      );
    } catch {
      return false;
    }
  });
  if (!product || !clean(product.name) || !assetId)
    throw new Error("官方商品結構化資料缺失或商品編號不符");
  const offer = Array.isArray(product.offers)
    ? product.offers[0]
    : product.offers;
  const price =
    typeof offer?.price === "number" ||
    (typeof offer?.price === "string" &&
      /^\d+(\.\d+)?$/.test(offer.price.trim()))
      ? Number(offer.price)
      : NaN;
  const inStock = /\/InStock$/.test(offer?.availability || "");
  return {
    source: "asset-store",
    key: assetId,
    existingSlug: entry.slug,
    name: clean(load(product.name).text(), 150),
    publisher: clean(load(product.brand?.name || "").text(), 100),
    // Store the brief metadata, never reviews, scripts, images, or package binaries.
    description: clean(load(product.description || "").text()),
    officialUrl: entry.url,
    sourceUrl: entry.url,
    version: null,
    editorVersion: null,
    license: null,
    isFree:
      inStock && Number.isFinite(price) && price >= 0 ? price === 0 : null,
    updatedAt: null,
    status: inStock ? "active" : "unavailable",
  };
}
