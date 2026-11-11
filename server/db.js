import "dotenv/config";
import mysql from "mysql2/promise";
import session from "express-session";

export const database = process.env.DB_NAME || "unity_packages";
if (!/^[a-zA-Z0-9_]+$/.test(database)) throw new Error("Invalid database name");
export const connectionOptions = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  charset: "utf8mb4",
  timezone: "Z",
  dateStrings: true,
};
export const pool = mysql.createPool({
  ...connectionOptions,
  database,
  connectionLimit: 10,
});
// mysql2's timezone option handles JS values; MySQL sessions must also use UTC.
pool.pool.on("connection", (connection) =>
  connection.query("SET time_zone = '+00:00'"),
);

export class MysqlSessionStore extends session.Store {
  get(sid, callback) {
    pool
      .execute(
        "SELECT data FROM sessions WHERE sid = ? AND expires > UTC_TIMESTAMP()",
        [sid],
      )
      .then(([rows]) => {
        try {
          callback(null, rows[0] ? JSON.parse(rows[0].data) : null);
        } catch (e) {
          callback(e);
        }
      }, callback);
  }
  set(sid, data, callback = () => {}) {
    const expires = new Date(data.cookie.expires || Date.now() + 86400000);
    pool
      .execute(
        "INSERT INTO sessions (sid, data, expires) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE data = VALUES(data), expires = VALUES(expires)",
        [sid, JSON.stringify(data), expires],
      )
      .then(() => callback(), callback);
  }
  destroy(sid, callback = () => {}) {
    pool
      .execute("DELETE FROM sessions WHERE sid = ?", [sid])
      .then(() => callback(), callback);
  }
  touch(sid, data, callback = () => {}) {
    this.set(sid, data, callback);
  }
}
