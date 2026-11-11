import express from "express";
import session from "express-session";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool, MysqlSessionStore } from "./db.js";
import { categories } from "./catalog.js";
import { getShowcases, showcaseCounts, packageKey } from "./showcases.js";
import { resources, resourceMetadata, getResources } from "./resources.js";
import { resolvePage, renderShell, robotsTxt, sitemapXml } from "./spa.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const prod = process.env.NODE_ENV === "production";
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32)
  throw new Error("SESSION_SECRET must be at least 32 characters");
export const app = express();
if (prod && process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'"],
        upgradeInsecureRequests: prod ? [] : null,
      },
    },
    strictTransportSecurity: prod ? undefined : false,
  }),
);
app.use(express.json({ limit: "32kb" }));
app.use(
  "/api",
  rateLimit({
    windowMs: 60000,
    limit: 240,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: { error: "操作太頻繁，請稍後再試。" },
  }),
);
const cookieName = process.env.SESSION_COOKIE_NAME || "unity.sid";
app.use(
  "/api",
  session({
    name: cookieName,
    secret: process.env.SESSION_SECRET,
    store: new MysqlSessionStore(),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: "lax", secure: prod, maxAge: 86400000 },
  }),
);
app.use("/api", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    if (!req.body || typeof req.body !== "object" || Array.isArray(req.body))
      return res.status(400).json({ error: "請使用 JSON 物件提交資料。" });
    const allowed = process.env.APP_ORIGIN || "http://localhost:5173";
    if (req.headers.origin && req.headers.origin !== allowed)
      return res.status(403).json({ error: "不允許的請求來源。" });
    const expected = req.session.csrf;
    if (!expected || req.headers["x-csrf-token"] !== expected)
      return res
        .status(403)
        .json({ error: "連線驗證已過期，請重新整理後再試。" });
  }
  next();
});
const auth = (req, res, next) =>
  req.session.userId
    ? next()
    : res.status(401).json({ error: "請先登入會員。" });
const token = () => crypto.randomBytes(32).toString("hex");
const text = (value, max = 200) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const positiveId = (value) =>
  /^\d+$/.test(String(value)) &&
  Number.isSafeInteger(Number(value)) &&
  Number(value) > 0;
const types = ["討論", "心得", "教學", "發問", "分享"];
const packageResult = (p) => ({
  ...p,
  tags: JSON.parse(p.tags),
  is_free: p.is_free === null ? null : Boolean(p.is_free),
  saved: Boolean(p.saved),
  ...showcaseCounts(p),
});
const getUser = async (id) => {
  const [[u]] = await pool.execute(
    "SELECT id,username,role,created_at FROM users WHERE id=?",
    [id],
  );
  return u || null;
};
const sessionSave = (req) =>
  new Promise((resolve, reject) =>
    req.session.save((e) => (e ? reject(e) : resolve())),
  );
async function logIn(req, id, remember) {
  await new Promise((resolve, reject) =>
    req.session.regenerate((e) => (e ? reject(e) : resolve())),
  );
  req.session.userId = id;
  req.session.csrf = token();
  req.session.cookie.maxAge = remember ? 30 * 86400000 : 86400000;
  await sessionSave(req);
}
app.get("/api/health", async (req, res) => {
  await pool.query("SELECT 1");
  res.json({ ok: true, database: "connected" });
});
app.get("/api/auth/session", async (req, res) => {
  req.session.csrf ||= token();
  const user = req.session.userId ? await getUser(req.session.userId) : null;
  res.json({ user, csrfToken: req.session.csrf });
});
const authLimit = rateLimit({
  windowMs: 15 * 60000,
  limit: 30,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "登入嘗試過多，請 15 分鐘後重試。" },
});
app.post("/api/auth/register", authLimit, async (req, res) => {
  const username = text(req.body.username, 30),
    email = text(req.body.email, 254).toLowerCase(),
    password = req.body.password;
  if (!/^[\p{L}\p{N}_-]{2,24}$/u.test(username))
    return res
      .status(400)
      .json({ error: "帳號需為 2–24 個中文字、英數字、底線或連字號。" });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "請輸入有效的電子郵件。" });
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password) > 72
  )
    return res
      .status(400)
      .json({ error: "密碼至少 8 個字元，且不超過 72 bytes。" });
  const hash = await bcrypt.hash(password, 12);
  try {
    const [result] = await pool.execute(
      "INSERT INTO users(username,email,password_hash) VALUES(?,?,?)",
      [username, email, hash],
    );
    await logIn(req, result.insertId, false);
    res.status(201).json({
      user: await getUser(result.insertId),
      csrfToken: req.session.csrf,
    });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "帳號或電子郵件已被使用。" });
    throw e;
  }
});
const dummyHash = await bcrypt.hash(crypto.randomBytes(24).toString("hex"), 12);
app.post("/api/auth/login", authLimit, async (req, res) => {
  const identifier = text(req.body.identifier, 254);
  if (
    typeof req.body.password !== "string" ||
    Buffer.byteLength(req.body.password) > 72
  )
    return res.status(400).json({ error: "請輸入帳號與密碼。" });
  const [[user]] = await pool.execute(
    "SELECT id,password_hash FROM users WHERE username=? OR email=?",
    [identifier, identifier.toLowerCase()],
  );
  const valid = await bcrypt.compare(
    req.body.password,
    user?.password_hash.startsWith("$2") ? user.password_hash : dummyHash,
  );
  if (!user || !valid || user.password_hash === "!disabled")
    return res.status(401).json({ error: "帳號或密碼不正確。" });
  await logIn(req, user.id, req.body.remember === true);
  res.json({ user: await getUser(user.id), csrfToken: req.session.csrf });
});
app.post("/api/auth/logout", auth, async (req, res) => {
  await new Promise((resolve, reject) =>
    req.session.destroy((e) => (e ? reject(e) : resolve())),
  );
  res.clearCookie(cookieName, { path: "/" });
  res.json({ ok: true });
});
app.get("/api/stats", async (req, res) => {
  const [[stats]] = await pool.query(
    `SELECT (SELECT COUNT(*) FROM packages) packages, (SELECT COUNT(*) FROM topics) topics, (SELECT COUNT(*) FROM replies) replies, (SELECT COUNT(*) FROM users WHERE role='member') members`,
  );
  res.json(stats);
});
app.get("/api/categories", async (req, res) => {
  const [counts] = await pool.query(
    "SELECT category_id,COUNT(*) count FROM topics GROUP BY category_id",
  );
  res.json(
    categories.map((c) => ({
      ...c,
      count: counts.find((x) => x.category_id === c.id)?.count || 0,
    })),
  );
});
app.get("/api/packages", async (req, res) => {
  const q = text(req.query.q, 100),
    category = text(req.query.category, 30);
  const where = [],
    params = [req.session.userId || 0];
  if (q) {
    where.push(
      "(p.name LIKE ? OR p.summary LIKE ? OR p.tags LIKE ? OR p.publisher LIKE ? OR p.source_key LIKE ?)",
    );
    params.push(...Array(5).fill("%" + q + "%"));
  }
  if (category) {
    where.push("p.category_id=?");
    params.push(category);
  }
  if (req.query.free === "true") where.push("p.is_free=1");
  if (req.query.source) {
    where.push("p.source_type=?");
    params.push(text(req.query.source, 24));
  }
  if (req.query.saved === "true") {
    if (!req.session.userId)
      return res.status(401).json({ error: "請先登入查看收藏。" });
    where.push("f.user_id IS NOT NULL");
  }
  const [rows] = await pool.execute(
    `SELECT p.*,f.user_id IS NOT NULL saved FROM packages p LEFT JOIN favorites f ON f.package_id=p.id AND f.user_id=? ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY p.id`,
    params,
  );
  res.json(rows.map(packageResult));
});
app.get("/api/packages/:id", async (req, res) => {
  if (!positiveId(req.params.id))
    return res.status(400).json({ error: "套件編號格式不正確。" });
  const [[p]] = await pool.execute(
    "SELECT p.*,f.user_id IS NOT NULL saved FROM packages p LEFT JOIN favorites f ON f.package_id=p.id AND f.user_id=? WHERE p.id=?",
    [req.session.userId || 0, req.params.id],
  );
  if (!p) return res.status(404).json({ error: "找不到這個套件。" });
  res.json({
    ...packageResult(p),
    showcases: getShowcases(p),
    resources: getResources(p),
  });
});
app.get("/api/resources", async (req, res) => {
  const [packages] = await pool.query(
    "SELECT id,name,source_key,official_url FROM packages ORDER BY id",
  );
  res.json(
    resources.map((r) => ({
      ...resourceMetadata(r),
      packages: packages
        .filter((p) => r.packageKeys.includes(packageKey(p)))
        .map(({ id, name }) => ({ id, name })),
    })),
  );
});
app.get("/api/resources/:id/download", auth, (req, res, next) => {
  const resource = resources.find((r) => r.id === req.params.id);
  if (!resource) return res.status(404).json({ error: "找不到這份開發指南。" });
  res.set("Cache-Control", "private, no-store");
  res.download(
    path.join(root, "server", "downloads", resource.fileName),
    resource.fileName,
    {
      headers: { "Content-Type": "text/markdown; charset=utf-8" },
    },
    (error) => {
      if (error) next(error);
    },
  );
});
app.put("/api/favorites/:id", auth, async (req, res) => {
  if (!positiveId(req.params.id) || typeof req.body.saved !== "boolean")
    return res.status(400).json({ error: "收藏資料格式不正確。" });
  const [[p]] = await pool.execute("SELECT id FROM packages WHERE id=?", [
    req.params.id,
  ]);
  if (!p) return res.status(404).json({ error: "找不到這個套件。" });
  if (req.body.saved)
    await pool.execute(
      "INSERT IGNORE INTO favorites(user_id,package_id) VALUES(?,?)",
      [req.session.userId, p.id],
    );
  else
    await pool.execute(
      "DELETE FROM favorites WHERE user_id=? AND package_id=?",
      [req.session.userId, p.id],
    );
  res.json({ saved: req.body.saved });
});
app.get("/api/topics", async (req, res) => {
  const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(req.query.page) || 1),
    ),
    limit = 10;
  const where = [],
    params = [];
  if (req.query.category) {
    where.push("t.category_id=?");
    params.push(text(req.query.category, 30));
  }
  if (req.query.q) {
    where.push("(t.title LIKE ? OR t.body LIKE ? OR t.tags LIKE ?)");
    params.push(...Array(3).fill("%" + text(req.query.q, 100) + "%"));
  }
  if (req.query.mine === "true") {
    if (!req.session.userId)
      return res.status(401).json({ error: "請先登入。" });
    where.push("t.user_id=?");
    params.push(req.session.userId);
  }
  const clause = where.length ? "WHERE " + where.join(" AND ") : "";
  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) total FROM topics t ${clause}`,
    params,
  );
  const sort =
    req.query.sort === "popular"
      ? "t.views DESC"
      : req.query.sort === "replies"
        ? "reply_count DESC"
        : "t.created_at DESC";
  const [rows] = await pool.execute(
    `SELECT t.id,t.title,t.type,t.tags,t.pinned,t.views,t.category_id,t.created_at,t.updated_at,u.username,u.role,(SELECT COUNT(*) FROM replies r WHERE r.topic_id=t.id) reply_count FROM topics t JOIN users u ON u.id=t.user_id ${clause} ORDER BY t.pinned DESC,${sort},t.id DESC LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
    params,
  );
  res.json({
    items: rows,
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
  });
});
app.get("/api/topics/:id", async (req, res) => {
  if (!positiveId(req.params.id))
    return res.status(404).json({ error: "找不到這篇主題。" });
  const [[topic]] = await pool.execute(
    "SELECT t.*,u.username,u.role FROM topics t JOIN users u ON u.id=t.user_id WHERE t.id=?",
    [req.params.id],
  );
  if (!topic) return res.status(404).json({ error: "找不到這篇主題。" });
  await pool.execute("UPDATE topics SET views=views+1 WHERE id=?", [topic.id]);
  topic.views++;
  const [replies] = await pool.execute(
    "SELECT r.id,r.body,r.created_at,u.username,u.role FROM replies r JOIN users u ON u.id=r.user_id WHERE r.topic_id=? ORDER BY r.created_at,r.id",
    [topic.id],
  );
  let relatedPackage = null;
  if (topic.package_id) {
    const [[p]] = await pool.execute(
      "SELECT p.*, EXISTS(SELECT 1 FROM favorites f WHERE f.package_id=p.id AND f.user_id=?) saved FROM packages p WHERE p.id=?",
      [req.session.userId || 0, topic.package_id],
    );
    relatedPackage = p ? packageResult(p) : null;
  }
  res.json({ ...topic, replies, package: relatedPackage });
});
const postLimit = rateLimit({
  windowMs: 60000,
  limit: 12,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "發文太快了，請稍後再試。" },
});
app.post("/api/topics", auth, postLimit, async (req, res) => {
  const title = text(req.body.title, 160),
    body = text(req.body.body, 12000),
    category = text(req.body.category, 30),
    type = text(req.body.type, 20),
    tags = text(req.body.tags, 200);
  if (title.length < 4 || body.length < 10)
    return res
      .status(400)
      .json({ error: "標題至少 4 個字，內容至少 10 個字。" });
  if (!categories.some((c) => c.id === category) || !types.includes(type))
    return res.status(400).json({ error: "請選擇有效的分類與主題類型。" });
  const [r] = await pool.execute(
    "INSERT INTO topics(user_id,category_id,title,body,type,tags) VALUES(?,?,?,?,?,?)",
    [req.session.userId, category, title, body, type, tags],
  );
  res.status(201).json({ id: r.insertId });
});
app.post("/api/topics/:id/replies", auth, postLimit, async (req, res) => {
  const body = text(req.body.body, 8000);
  if (!positiveId(req.params.id) || body.length < 2)
    return res.status(400).json({ error: "回覆至少需要 2 個字。" });
  const [[topic]] = await pool.execute("SELECT id FROM topics WHERE id=?", [
    req.params.id,
  ]);
  if (!topic) return res.status(404).json({ error: "找不到這篇主題。" });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.execute(
      "INSERT INTO replies(topic_id,user_id,body) VALUES(?,?,?)",
      [topic.id, req.session.userId, body],
    );
    await conn.execute(
      "UPDATE topics SET updated_at=CURRENT_TIMESTAMP WHERE id=?",
      [topic.id],
    );
    await conn.commit();
    res.status(201).json({ id: r.insertId });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});
app.post("/api/recommend", async (req, res) => {
  const description = text(req.body.description, 1000),
    selected = Array.isArray(req.body.features)
      ? req.body.features.filter((x) => typeof x === "string").slice(0, 8)
      : [];
  if (description.length < 2 && !selected.length)
    return res
      .status(400)
      .json({ error: "請描述遊戲構想，或至少選擇一個需求。" });
  const [rows] = await pool.execute(
    "SELECT p.*,EXISTS(SELECT 1 FROM favorites f WHERE f.package_id=p.id AND f.user_id=?) saved FROM packages p",
    [req.session.userId || 0],
  );
  const haystack = (description + " " + selected.join(" ")).toLowerCase();
  const matches = rows
    .map(packageResult)
    .filter((p) => !req.body.freeOnly || p.is_free)
    .map((p) => {
      const matched = p.tags.filter(
        (t) =>
          haystack.includes(t.toLowerCase()) ||
          selected.some((s) => t.includes(s) || s.includes(t)),
      );
      return {
        ...p,
        score: matched.length,
        reason: matched.length ? "符合需求：" + matched.join("、") : "",
      };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  res.json({
    mode: "catalog-rules",
    items: matches,
    note: matches.length
      ? "依本站套件用途標籤配對，適合作為研究起點；尚未實測套件間相容性。"
      : "目前索引沒有符合的套件，請試試更具體的功能標籤或調整免費篩選。",
  });
});
app.use("/api", (req, res) =>
  res.status(404).json({ error: "找不到此服務。" }),
);
// ---- 網站頁面 ----
const dist = path.join(root, "dist");
let shellCache = null;
async function shell() {
  if (shellCache && prod) return shellCache;
  shellCache = await fs.readFile(path.join(dist, "index.html"), "utf8");
  return shellCache;
}
app.get("/robots.txt", (req, res) =>
  res.type("text/plain").set("Cache-Control", "public, max-age=3600").send(robotsTxt()),
);
app.get("/sitemap.xml", async (req, res) => {
  res
    .type("application/xml")
    .set("Cache-Control", "public, max-age=3600")
    .send(await sitemapXml(pool));
});
// Vite 產生的檔名含雜湊值，可長期快取；其他靜態檔快取一天。
app.use(
  express.static(dist, {
    index: false,
    setHeaders(res, file) {
      res.setHeader(
        "Cache-Control",
        /[\\/]assets[\\/].+-[\w-]{8}\.(js|css)$/.test(file)
          ? "public, max-age=31536000, immutable"
          : "public, max-age=86400",
      );
    },
  }),
);
// 有副檔名但找不到的檔案（例如舊版 JS）直接回 404，不回傳網頁。
app.get(/\.[a-z0-9]+$/i, (req, res) => res.status(404).type("text/plain").send("Not found"));
app.get("/{*path}", async (req, res) => {
  const page = await resolvePage(req.path, pool);
  res
    .status(page.status)
    .type("html")
    .set("Cache-Control", "no-cache")
    .send(renderShell(await shell(), page, req.path));
});
app.use((error, req, res, next) => {
  console.error("Request failed:", error.code || error.type || error.name);
  if (res.headersSent) return next(error);
  const bad =
    error.type === "entity.parse.failed" || error.type === "entity.too.large";
  res.status(bad ? 400 : 500).json({
    error: bad
      ? "請求格式不正確或內容過長。"
      : "服務暫時無法使用，請稍後再試。",
  });
});
