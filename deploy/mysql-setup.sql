-- 建立正式站資料庫與專用帳號（只執行一次）
-- 用法：先把下面的 '請改成強密碼' 換掉，再執行
--   sudo mysql < deploy/mysql-setup.sql
-- 同一組密碼要填進 .env 的 DB_PASSWORD。

CREATE DATABASE IF NOT EXISTS unity_packages
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'unity_app'@'localhost' IDENTIFIED BY '請改成強密碼';
CREATE USER IF NOT EXISTS 'unity_app'@'127.0.0.1' IDENTIFIED BY '請改成強密碼';

GRANT ALL PRIVILEGES ON unity_packages.* TO 'unity_app'@'localhost';
GRANT ALL PRIVILEGES ON unity_packages.* TO 'unity_app'@'127.0.0.1';
FLUSH PRIVILEGES;
