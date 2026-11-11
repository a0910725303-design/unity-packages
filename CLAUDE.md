# Unity 套件網站 — Claude Code 專案說明

繁體中文 Unity 套件交流網站（論壇＋套件索引＋會員）。所有回覆、介面文字、文件一律使用**繁體中文**。

共用的協作約定與本機資料庫設定在 AGENTS.md（原本給 Codex 使用，內容同樣適用）：

@AGENTS.md

目前要執行的工作清單：見 `NEXT_STEPS.md`，照順序做，完成一項就在該檔打勾 `[x]`。

## 技術架構

- Node.js 22（最低 20.19）、npm、ES Modules（`"type": "module"`）
- 後端：Express 5 + MySQL（mysql2）+ express-session（session 存在 MySQL）
- 前端：React 19 + Vite 7，單頁應用，使用一般網址（History API），**不使用 `#/`**
- 正式站：VPS（Ubuntu）＋ Nginx（HTTPS）＋ PM2，網址 https://unity.nestw.net，步驟見 `DEPLOY.md`

## 常用指令（Windows PowerShell，於專案根目錄）

| 用途 | 指令 |
| --- | --- |
| 安裝相依 | `npm install` |
| 建立／更新資料表與起始資料 | `npm run db:setup` |
| 開發模式（前端 5173、API 3001） | `npm run dev` |
| 建置前端到 `dist/` | `npm run build` |
| 啟動建置後網站 | `$env:APP_ORIGIN='http://127.0.0.1:3001'; npm start` |
| 測試（使用 `unity_packages_test` 測試庫） | `npm test`（先 `npm run build`） |

`npm run dev`、`npm start` 會持續執行，請在背景啟動，測完要停止，不要留著佔用連接埠。
PowerShell 裡請用 `curl.exe`（不是 `curl`，那是 Invoke-WebRequest 的別名）。

## 目錄

```text
src/main.jsx          前端進入點（舊 #/ 網址轉換、站內連結攔截）
src/App.jsx           網站外框與頁面切換
src/pages/            各頁面
src/components/       共用元件
src/lib/              api.js（API 呼叫＋CSRF）、router.js（網址）、format.js、meta.js（頁面標題）
server/app.js         Express API 與網站頁面輸出
server/spa.js         依網址產生 <title>／描述、robots.txt、sitemap.xml，不存在的頁面回 404
server/setup.js       資料表建立（可重複執行、不刪資料）
server/crawler/       套件爬蟲
deploy/               VPS 部署腳本、Nginx、PM2、MySQL 帳號、正式環境 .env 樣板
codex/                AI 工程區（測試、截圖、紀錄、備份）；網站程式不可放這裡
example/              使用者提供的參考頁面，不可修改、不可複製其中帳號與追蹤碼
```

## 網址規則

`/`、`/topics`、`/topics/:id`、`/mine`、`/packages`、`/packages/:id`、`/favorites`、`/recommend`、`/guide`、`/resources`。
站內連結寫 `href="/packages"`，程式內切頁用 `navigate()`（`src/lib/router.js`），產生網址用 `topicUrl(id)`、`packageUrl(id)`。
新增頁面時，要同時更新 `src/lib/router.js`（routes、matchRoute）、`src/App.jsx`（renderPage、pageTitles）、`src/components/Breadcrumb.jsx` 與 `server/spa.js`（staticPages）。

## 安全規則（必須遵守）

- **絕不**在輸出、日誌、commit、文件中印出 `.env` 或 `AGENTS.md` 裡的密碼。
- `.env`、`AGENTS.md`、`codex/`、`example/`、`node_modules/`、`dist/` 不可加入 git；commit 前一定先 `git status` 檢查。
- 沒有使用者明確同意，不要 `git push`、不要連線到正式 VPS 執行會改變狀態的指令、不要刪除資料庫資料。
- SQL 一律參數化；密碼只存 bcrypt 雜湊；維持現有 CSRF 與來源檢查。
- 正式站不可使用 MySQL root 帳號。

## 樣式偏好

保留緊湊的論壇版面（參考 `example/`）。介面文字至少 13px；分類名稱與主題列表 14px；文章與回覆內文 15px；區塊標題至少 16px；手機版也不可縮到 10–12px。
