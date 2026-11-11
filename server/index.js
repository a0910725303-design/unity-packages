import { app } from "./app.js";
import { pool } from "./db.js";
const host = process.env.HOST || "127.0.0.1",
  port = Number(process.env.PORT || 3001);
try {
  await pool.query("SELECT 1 FROM categories LIMIT 1");
  const server = app.listen(port, host, () =>
    console.log(`Unity 套件 API / 網站：http://${host}:${port}`),
  );
  const cleanup = setInterval(
    () =>
      pool
        .query("DELETE FROM sessions WHERE expires < UTC_TIMESTAMP()")
        .catch(() => {}),
    3600000,
  );
  cleanup.unref();
  const stop = () =>
    server.close(async () => {
      clearInterval(cleanup);
      await pool.end();
      process.exit(0);
    });
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
} catch (e) {
  console.error(
    "無法啟動，請確認 MySQL 設定並執行 npm run db:setup。",
    e.code || "",
  );
  await pool.end();
  process.exitCode = 1;
}
