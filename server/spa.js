// 網頁外殼（dist/index.html）的伺服器端處理：
// 依網址填入正確的標題、描述與分享卡片，並產生 robots.txt、sitemap.xml。
// 前端仍是 React 單頁應用，這裡只負責讓搜尋引擎與社群分享看到正確資訊。

export const SITE_NAME = "Unity 套件";
export const DEFAULT_TITLE = "Unity 套件｜開發者的資源交流站";
export const DEFAULT_DESCRIPTION =
  "Unity 套件開發者社群，探索套件、交流實作心得，找到適合下一個遊戲的工具。";

const staticPages = {
  "/": { title: null, priority: "1.0" },
  "/topics": { title: "論壇主題", priority: "0.8" },
  "/packages": { title: "套件探索", priority: "0.9" },
  "/recommend": { title: "智慧選包", priority: "0.6" },
  "/guide": { title: "新手指南", priority: "0.5" },
  "/resources": { title: "免費開發指南下載", priority: "0.6" },
};
// 會員專屬頁面：可以開啟，但不給搜尋引擎收錄。
const privatePages = {
  "/mine": "我的主題",
  "/favorites": "我的收藏",
};

export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const clean = (text, max = 160) =>
  String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export const siteOrigin = () =>
  (process.env.APP_ORIGIN || "http://127.0.0.1:3001").replace(/\/+$/, "");

// 找出網址對應的頁面資訊。回傳 { status, title, description, noindex }。
export async function resolvePage(pathname, pool) {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (staticPages[path])
    return { status: 200, title: staticPages[path].title };
  if (privatePages[path])
    return { status: 200, title: privatePages[path], noindex: true };
  const match = path.match(/^\/(topics|packages)\/(\d{1,10})$/);
  if (match) {
    const [, kind, id] = match;
    if (kind === "packages") {
      const [[p]] = await pool.execute(
        "SELECT name, summary FROM packages WHERE id=?",
        [id],
      );
      if (p) return { status: 200, title: p.name, description: p.summary };
    } else {
      const [[t]] = await pool.execute(
        "SELECT title, body FROM topics WHERE id=?",
        [id],
      );
      if (t) return { status: 200, title: t.title, description: t.body };
    }
    return {
      status: 404,
      title: kind === "packages" ? "找不到套件" : "找不到主題",
      noindex: true,
    };
  }
  return { status: 404, title: "找不到頁面", noindex: true };
}

// 把頁面資訊寫進 index.html 的 <head>。
export function renderShell(html, page, requestPath) {
  const origin = siteOrigin();
  const title = page.title ? `${clean(page.title, 90)}｜${SITE_NAME}` : DEFAULT_TITLE;
  const description = clean(page.description || DEFAULT_DESCRIPTION);
  const canonical = origin + (requestPath.replace(/\/+$/, "") || "/");
  const t = escapeHtml(title),
    d = escapeHtml(description),
    c = escapeHtml(canonical);
  let out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${d}$2`,
    )
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${t}$2`)
    .replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${d}$2`,
    )
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${c}$2`)
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${c}$2`)
    .replace(
      /(<meta\s+property="og:image"\s+content=")\/([^"]*")/,
      `$1${escapeHtml(origin)}/$2`,
    );
  if (page.noindex)
    out = out.replace(
      "</head>",
      '    <meta name="robots" content="noindex" />\n  </head>',
    );
  return out;
}

export function robotsTxt() {
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /mine",
    "Disallow: /favorites",
    "",
    `Sitemap: ${siteOrigin()}/sitemap.xml`,
    "",
  ].join("\n");
}

export async function sitemapXml(pool) {
  const origin = siteOrigin();
  const [packages] = await pool.query(
    "SELECT id FROM packages ORDER BY id LIMIT 20000",
  );
  const [topics] = await pool.query(
    "SELECT id, updated_at FROM topics ORDER BY id DESC LIMIT 20000",
  );
  const url = (loc, extra = "") =>
    `  <url><loc>${escapeHtml(origin + loc)}</loc>${extra}</url>`;
  const lastmod = (value) => {
    if (!value) return "";
    const d = new Date(String(value).replace(" ", "T") + (String(value).includes("T") ? "" : "Z"));
    return Number.isNaN(d.getTime())
      ? ""
      : `<lastmod>${d.toISOString().slice(0, 10)}</lastmod>`;
  };
  const lines = [
    ...Object.entries(staticPages).map(([loc, p]) =>
      url(loc, `<priority>${p.priority}</priority>`),
    ),
    ...packages.map((p) => url(`/packages/${p.id}`)),
    ...topics.map((t) => url(`/topics/${t.id}`, lastmod(t.updated_at))),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${lines.join("\n")}\n</urlset>\n`;
}
