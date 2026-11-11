# 待執行工作清單（給 Claude Code）

背景：2026/11/11 已把前端從單一 `main.jsx` 拆成 `src/pages`、`src/components`、`src/lib`，網址從 `#/` 改成一般網址，
新增 `server/spa.js`（頁面標題、404、robots、sitemap）與 `deploy/` 部署檔。
這些修改已在 Chrome 配合假 API 驗證過操作流程，但**還沒有在真實環境跑過 `npm run build`、`npm test` 與 MySQL**。
修改前的原始檔備份在 `codex/backup-2026-11-11/`。

執行方式：照階段順序做。每完成一項就把 `[ ]` 改成 `[x]`。
遇到錯誤先自行修正並重跑；同一個問題修兩次仍失敗，就停下來向使用者說明。
標示 **🙋 需要使用者** 的步驟，要先停下來詢問，不可自行假設。

---

## 階段 1：本機驗證（可直接執行）

- [x] 1.1 確認環境：`node -v`（需 ≥ 20.19）、`npm -v`，以及 MySQL 服務有在執行。
- [x] 1.2 `npm install`
- [x] 1.3 `npm run build`，必須成功且沒有錯誤。
- [x] 1.4 `npm run db:setup`
- [x] 1.5 `npm test`，全部通過（目前 32 項）。若失敗，判斷是這次重構造成的還是原本就有的問題，修正後重跑。
- [x] 1.6 在背景啟動正式模式：`$env:APP_ORIGIN='http://127.0.0.1:3001'; npm start`，然後用 `curl.exe` 檢查：

  | 網址 | 預期 |
  | --- | --- |
  | `http://127.0.0.1:3001/api/health` | 200，`database: connected` |
  | `http://127.0.0.1:3001/` | 200，HTML |
  | `http://127.0.0.1:3001/packages/1` | 200，`<title>` 是套件名稱｜Unity 套件 |
  | `http://127.0.0.1:3001/topics/1` | 200，`<title>` 是主題標題 |
  | `http://127.0.0.1:3001/packages/99999999` | 404 |
  | `http://127.0.0.1:3001/no-such-page` | 404 |
  | `http://127.0.0.1:3001/assets/not-exist.js` | 404，純文字（不可回傳網頁） |
  | `http://127.0.0.1:3001/robots.txt` | 200，含 `Sitemap:` |
  | `http://127.0.0.1:3001/sitemap.xml` | 200，含 `/packages/` 網址 |
  | 首頁 HTML 中引用的 `/assets/index-*.js` | 回應標頭 `Cache-Control` 含 `immutable` |

- [x] 1.7 在瀏覽器實際操作（有瀏覽器工具就用，沒有就請使用者打開 http://127.0.0.1:3001/ 檢查）：
  - 導覽列每一頁都能切換，網址正確、上一頁正常
  - `http://127.0.0.1:3001/#/package?id=1` 會自動變成 `/packages/1`
  - 在 `/packages/1` 按重新整理，仍停在同一頁
  - 註冊 → 自動登入 → 收藏套件 → 發文 → 回覆 → 登出，全部正常
  - 手機寬度（390px）沒有橫向捲軸
- [x] 1.8 停止背景的 `npm start`。
- [x] 1.9 把驗證結果寫進 `codex/verification-2026-11-11.md`，包含指令、結果與修了哪些問題。

## 階段 2：建立 Git 版本控制

- [ ] 2.1 `git init`、`git branch -M main`（若已經有 `.git` 就跳過）。
- [ ] 2.2 `git add .` 之後執行 `git status`，**確認清單中沒有** `.env`、`AGENTS.md`、`codex/`、`example/`、`node_modules/`、`dist/`。若有任何一個出現，就修正 `.gitignore`、`git rm --cached` 後重新檢查。
- [ ] 2.3 再搜尋一次，確認準備 commit 的檔案中沒有本機資料庫密碼（以 AGENTS.md 中的密碼字串對 staged 檔案搜尋，但**不要把密碼印出來**，只回報有或沒有）。
- [ ] 2.4 `git commit -m "重構前端結構、改用一般網址、新增 VPS 部署設定"`
- [ ] 2.5 🙋 **需要使用者**：詢問是否已在 GitHub 建立私人倉庫，取得網址後才執行 `git remote add origin <網址>`、`git push -u origin main`。使用者還沒準備好就跳過，進入階段 3 時再問。

## 階段 3：部署到 VPS（依 DEPLOY.md）

開始前 🙋 **需要使用者**提供：

1. VPS 的 IP、SSH 帳號，以及是否已經能用 `ssh 帳號@IP` 免密碼（金鑰）登入
2. VPS 作業系統版本（需 Ubuntu 22.04 / 24.04）
3. `nestw.net` 的 DNS 由誰管理（網域商或 Cloudflare）
4. 程式要用 GitHub（方法 A）還是打包上傳（方法 B）

執行原則：

- 用 `ssh 帳號@IP "指令"` 執行非互動指令。需要輸入密碼的步驟（`sudo` 密碼、`mysql -p`、`certbot` 的 email 與同意條款、`nano` 編輯），**請把完整指令交給使用者自己在終端機執行**，等使用者回報結果再繼續。
- 密碼、`SESSION_SECRET` 請使用者自己產生並填寫，不要經手、不要印出。

步驟：

- [ ] 3.1 🙋 引導使用者在 DNS 新增 A 記錄 `unity` → VPS IP（DEPLOY.md 第 1 步），並用 `nslookup unity.nestw.net` 確認已生效。
- [ ] 3.2 把程式放到 VPS 的 `/var/www/unity-packages`（DEPLOY.md 第 2 步）。
- [ ] 3.3 🙋 使用者執行 `sudo bash deploy/setup-server.sh`（第 3 步）。
- [ ] 3.4 🙋 使用者修改 `deploy/mysql-setup.sql` 的密碼並執行（第 4 步）。
- [ ] 3.5 🙋 使用者建立並填寫 VPS 上的 `.env`（第 5 步）。完成後可以用 `grep -c` 檢查各欄位是否已填（不可印出值）。
- [ ] 3.6 詢問是否要搬本機資料（第 6 步）。要的話，在 Windows 用 `mysqldump --result-file` 匯出（**不可用 `>`**，會變成 UTF-16 亂碼），用 `scp` 上傳，再請使用者在 VPS 匯入。匯入後刪除 VPS 和本機上的 `.sql` 檔。
- [ ] 3.7 在 VPS 執行 `bash deploy/deploy.sh`，看到 `✓ 網站運作正常`（第 7 步）。🙋 使用者執行 `pm2 startup` 印出的 sudo 指令，然後執行 `pm2 save`。
- [ ] 3.8 🙋 Nginx 設定與 `sudo certbot --nginx -d unity.nestw.net`（第 8 步）。
- [ ] 3.9 從本機執行上線檢查（第 9 步）：
  - `curl.exe -I https://unity.nestw.net/` → 200，有 `strict-transport-security` 標頭
  - `curl.exe -I http://unity.nestw.net/` → 301 轉向 https
  - `https://unity.nestw.net/packages/1` 的 `<title>` 正確
  - `https://unity.nestw.net/sitemap.xml` 的網址都是 `https://unity.nestw.net/...`
  - 請使用者實際註冊一個帳號並重新整理，確認仍保持登入
- [ ] 3.10 🙋 設定每日備份 cron（第 10 步），並手動執行一次 `deploy/backup-db.sh` 確認備份檔有產生。
- [ ] 3.11 把部署結果（日期、Node/MySQL 版本、檢查結果）記錄在 `codex/deploy-log.md`（不可寫入任何密碼或 IP 以外的機密）。

## 階段 4：上線後（可選，先問使用者要不要做）

- [ ] 4.1 到 Google Search Console 加入網站並提交 `https://unity.nestw.net/sitemap.xml`（由使用者操作）。
- [ ] 4.2 在 VPS 上跑一次套件爬蟲並匯入，讓正式站與本機的套件數一致（README「套件爬蟲」一節）。
- [ ] 4.3 建議功能（等使用者決定）：忘記密碼／Email 驗證、管理後台（刪文、置頂）、文章 Markdown 與圖片上傳。
