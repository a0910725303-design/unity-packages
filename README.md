# Unity 套件

繁體中文 Unity 套件交流網站，採用伊莉／傳統論壇的藍色導覽、分類索引、置頂公告及討論列表，搭配原創品牌與遊戲風格插畫。

## 本機啟動

在 `D:\Unity網站分享` 開啟 PowerShell：

```powershell
npm install
npm run db:setup
npm run dev
```

開啟 **http://127.0.0.1:5173/**。後端使用 `127.0.0.1:3001`，前端會自動代理 `/api`。本機 `.env` 已依使用者提供的 MySQL 設定填好，資料庫名稱為 `unity_packages`。設定修改後需重啟伺服器。

右上角「立即註冊」可以建立自己的帳號與密碼，註冊完成會自動登入。網站帳號與 MySQL 帳號分開，不能用資料庫的 root 帳密登入網站。站方編輯室是內容署名，沒有可登入的預設密碼。

停止本機網站：在啟動的終端機按 `Ctrl+C`。

## 已完成

- 六個論壇分類、站方置頂公告、主題列表、排序及分頁。
- 帳號／電子郵件登入、註冊、登出、30 天保持登入。
- MySQL 持久化 session、bcrypt 密碼雜湊、CSRF 與來源檢查、參數化 SQL、登入與發文限流。
- 會員發文、回覆、我的主題；未登入時限制寫入。
- 套件索引、名稱／作者／識別碼及用途搜尋、分類／來源／免費篩選、分頁、會員私人收藏。
- 套件導向 Unity 官方文件、作者 GitHub 或 Unity Asset Store 商品頁，顯示來源與擷取時間。
- 獨立爬蟲工具、原始結果檔、人工用途整理及可重複執行的資料庫匯入。
- 智慧選包：依描述和功能標籤配對本站索引，明確標示為規則配對。
- 桌面與手機響應式版面、鍵盤可操作的登入／發文對話框。
- 真實資料庫統計；起始文章標示為站方內容，沒有虛構會員或評論數。

`db:setup` 提供 8 個起始套件及 10 篇起始文章。2026/10/25 已執行爬蟲並將本機工具箱擴充至 154 個套件（123 個 Unity 官方、21 個作者 GitHub、10 個 Asset Store），包含 Ultimate Inventory System 與 Inventory Engine 兩套 RPG 物品欄工具。新環境可依下方步驟重新擷取。價格、授權與支援版本以來源為準；本站未串接生成式 AI API、金流、聯盟追蹤、信箱驗證、忘記密碼郵件或管理後台。正式站部署至 https://unity.nestw.net，步驟見 [DEPLOY.md](DEPLOY.md)。

## 套件爬蟲：先擷取，再整理，最後匯入

爬蟲是可獨立執行的 Node.js 工具。第一步只取得公開資訊並輸出檔案，不連線資料庫；整理與匯入由另外兩個命令處理。收錄範圍是設定的官方目錄及作者來源，不宣稱涵蓋網路上所有實用套件，也不代表已實測推薦。

在工作區根目錄執行，將 `run-001` 換成新的資料夾名稱，以保留每次的擷取紀錄：

```powershell
# 1. 工具批次擷取
npm run packages:crawl -- --output codex/crawl-data/run-001/raw.json

# 2. 整理繁體中文用途、分類、去重與排除項目
npm run packages:prepare -- --input codex/crawl-data/run-001/raw.json

# 3. 預覽新增及更新數量，再匯入開發工具箱
npm run packages:import -- --input codex/crawl-data/run-001/prepared.json --dry-run
npm run packages:import -- --input codex/crawl-data/run-001/prepared.json
```

匯入前需完成 `npm run db:setup`。匯入器從 `.env` 取得資料庫設定，不印出憑證。更新沿用原套件 ID，保留收藏與討論；使用參數化 SQL、交易與資料庫匯入鎖。`--dry-run` 不寫入套件；失敗來源不會導致既有資料被刪除。`db:setup` 也會套用新增欄位的非破壞性遷移。

資料來源：

- Unity 官方：預設讀取 [Unity 6000.3 已發佈套件](https://docs.unity3d.com/6000.3/Documentation/Manual/pack-safe.html) 與 [核心套件](https://docs.unity3d.com/6000.3/Documentation/Manual/pack-core.html)，再擷取各套件文件。可用 `--unity-version 6000.0` 指定其他文件版本。
- GitHub：讀取 `server/crawler/sources.js` 中作者倉庫的公開 API 與最新正式 release；沒有正式 release 就不填版本。封存倉庫不加入新收錄項目。
- Asset Store：讀取 `server/crawler/asset-catalog.js` 指定商品的公開結構化資料，其中也包含 `server/catalog.js` 的起始商品；僅在確認有效價格時判定免費／付費。沒有確認的價格或授權保留「未知」，Unity 雲端服務不直接標示免費。新增商品的官方網址、用途摘要與標籤維護於 `asset-catalog.js`，不會改動資料庫起始種子。

只保存套件基本資訊與來源，不下載或轉載套件本體、商品評論、遠端腳本及追蹤程式。預設每個來源主機的請求至少間隔一秒，檢查網頁 robots.txt，使用逾時、有限重試及回應大小上限；不繞過登入、驗證或限流。

常用參數及重試方式：

```powershell
npm run packages:crawl -- --help
npm run packages:crawl -- --source github --limit 3 --output codex/crawl-data/sample/raw.json
npm run packages:crawl -- --source asset-store --output codex/crawl-data/retry/raw.json
npm run packages:prepare -- --input codex/crawl-data/run-001/raw.json --input codex/crawl-data/retry/raw.json --output codex/crawl-data/merged/prepared.json
```

`--source` 可用 `all`、`unity`、`github`、`asset-store`。`--limit` 限制每種來源的項目數。省略 `--output` 時會建立時間戳資料夾。加上 `--snapshots` 可在同一資料夾的 `responses/` 保存公開 HTTP 回應，方便修正解析器。輸出檔案不覆寫既有檔案。

擷取結果包含成功項目及 `failures`；命令結束碼 `0` 為成功、`2` 為部分成功、`1` 為失敗。整理檔另含 `excluded`、`pendingReview` 與輸入檔 SHA-256。來源新增套件時，先查看原始說明，再於 `server/crawler/curation.js` 補上繁體中文摘要、分類與標籤；未整理項目只列入 `pendingReview`，不會直接進入工具箱。重試檔可合併，來源識別碼相同時採較新的擷取結果。

首批結果保存於 `codex/crawl-data/2026-10-25/`；追加的兩套 RPG 物品欄結果保存於 `codex/crawl-data/2026-10-25-inventory/`，分類為「遊戲系統」，可搜尋「物品欄」、「背包」或「裝備欄」。已排除封存的 UniRx 與官方已停止支援直接廣告變現整合的 Advertisement Legacy；原始紀錄仍保留。爬蟲不會自行排程執行。

## 資料夾分工

```text
src/main.jsx          前端進入點
src/App.jsx           網站外框與頁面切換
src/pages/            各頁面（主題列表、主題內容、套件探索、套件介紹、智慧選包…）
src/components/       共用元件（頁首、頁尾、套件卡片、登入、發文、對話框…）
src/lib/              API 呼叫、網址路由、日期格式、頁面標題
src/styles.css        全站樣式
server/               Express API、MySQL schema 與起始資料
server/spa.js         依網址輸出頁面標題／描述、robots.txt、sitemap.xml
deploy/               VPS 部署：PM2、Nginx、MySQL 帳號、安裝／更新／備份腳本
DEPLOY.md             部署到 unity.nestw.net 的完整步驟
scripts/              網站啟動工具
public/assets/        正式圖片、品牌 SVG、原始 PNG 與最佳化 WebP
dist/                 npm run build 的網站建置輸出
codex/                AI 工程區：測試、工具環境、截圖及紀錄
example/              使用者提供的伊莉原始參考頁面
AGENTS.md             協作約定、目錄分工與指定本機 SQL 設定
.env                  本機執行設定
.env.example          不含真實憑證的設定樣板
```

網站程式位於工作區根目錄，**不是 `codex/`**。`.gitignore` 已排除 `codex/`、`example/`、`node_modules/`、`dist/`、`.env` 與 `AGENTS.md`（包含指定的本機憑證）。

## 建置後執行

```powershell
npm run build
$env:APP_ORIGIN = 'http://127.0.0.1:3001'
npm start
```

開啟 http://127.0.0.1:3001/。正式站台由 Express 僅提供 `dist/` 與 API，不會提供來源檔、工程資料或 `.env`。

正式部署請照 [DEPLOY.md](DEPLOY.md)：VPS（Ubuntu）＋ Nginx（HTTPS）＋ PM2 ＋ MySQL，網址 https://unity.nestw.net。正式環境設定樣板為 `.env.production.example`（`NODE_ENV=production`、`APP_ORIGIN`、`TRUST_PROXY=1`、獨立資料庫帳號、新的 `SESSION_SECRET`）。

## 網址

網站使用一般網址（History API），不再使用 `#/`。舊的 `#/` 連結會自動轉到新網址。

| 頁面 | 網址 |
| --- | --- |
| 論壇首頁 | `/` |
| 主題列表 | `/topics`、`/topics?category=tools`、`/topics?q=關鍵字` |
| 主題內容 | `/topics/1`（舊：`#/topic?id=1`） |
| 我的主題 | `/mine` |
| 套件探索 | `/packages`、`/packages?q=DOTween`、`/packages?cases=true` |
| 套件介紹 | `/packages/153`（舊：`#/package?id=153`） |
| 我的收藏／智慧選包／新手指南／開發指南下載 | `/favorites`、`/recommend`、`/guide`、`/resources` |

伺服器會依網址輸出對應的頁面標題、描述與分享卡片，不存在的主題或套件回傳 404；另提供 `/robots.txt` 與 `/sitemap.xml`。

## 測試

```powershell
npm test
```

32 項測試涵蓋會員與論壇流程、爬蟲解析與匯入、案例身分對應、套件詳情、公開指南介紹、登入／登出後的下載權限，以及 Markdown 檔案內容。資料庫測試使用獨立的 `unity_packages_test`，只清理本次產生的測試帳號、套件與內容，保留正式資料庫；解析器測試不連線外部網站。若需要重新建置，先完成 `npm run build` 再跑測試，避免 Vite 清空 `dist/` 時影響靜態頁驗證。

## 套件案例與免費開發指南

- `/packages/153` 等套件介紹頁提供成品、示範、觀看重點與使用證據；`/packages?cases=true` 只顯示已收錄案例的套件。
- `server/showcases.js` 保存人工核對的 12 個案例：7 個遊戲成品、5 個官方示範，涵蓋 9 套工具。以明確的來源 ID 對應，不因同一作者或相似名稱推論套件使用關係；未知版本與具體用途在證據說明中保留限制。其餘套件顯示尚無案例。
- `/resources` 提供 4 份免費 Markdown 指南的介紹；相關套件頁也會顯示指南。內容包括 RPG 物品欄、分支敘事、回合戰術、操作回饋小遊戲的原創規格、實作提示與驗收清單。
- `server/resources.js` 保存指南目錄；原始檔放在 `server/downloads/`，不放進 `public/` 或 `dist/`。Vite 既有的 `server/` 拒絕清單阻擋開發環境的直接存取。
- `GET /api/resources` 公開介紹；`GET /api/resources/:id/download` 由伺服器驗證登入 session，只允許目錄列出的檔案，使用附件下載與 `private, no-store`。免費下載不含第三方套件或素材授權。
- 擷取日期保留在內部爬蟲資料中，網站介面不顯示擷取時間。

瀏覽器測試用網站（需先 `npm run build`）：

```powershell
node codex/preview-server.mjs
```

測試網址 http://127.0.0.1:5180/，帳號 `codex_preview`、密碼 `Unity-QA-Only-2026!`，**僅存在測試庫**。手機驗證頁是 http://127.0.0.1:5180/__qa/mobile，內嵌 390px 網站 viewport。測試伺服器使用獨立 cookie 名稱，不影響開發站登入。

## 圖片與套件資料

兩張插畫使用內建 image_gen 製作，原始 prompt 保存於 `codex/image-prompts.json`。世界橫幅與控制器為社群視覺，並非任何商品的實際畫面。

- `public/assets/world-banner.png`、`world-banner.webp`：原創浮島遊戲世界。
- `public/assets/controller.png`、`controller.webp`：原創模組化遊戲控制器。
- `public/assets/mark.svg`：原創立方體標誌；「Unity 套件」文字由 HTML 呈現。

`server/catalog.js` 保存編輯索引與官方來源連結。`db:setup` 可重複執行，只新增缺少的起始資料，不覆寫會員內容；既有套件若需更新，應明確更新對應資料列。

官方資料核對日期：2026/10/25。來源包括 [DOTween](https://assetstore.unity.com/packages/tools/animation/dotween-hotween-v2-27676)、[Odin Inspector](https://assetstore.unity.com/packages/tools/utilities/odin-inspector-and-serializer-89041)、[Magica Cloth 2](https://assetstore.unity.com/packages/tools/physics/magica-cloth-2-242307)、[Final IK](https://assetstore.unity.com/packages/tools/animation/final-ik-14290)、[Easy Save](https://assetstore.unity.com/packages/tools/utilities/easy-save-the-complete-save-game-data-serializer-system-768)、[Feel](https://assetstore.unity.com/packages/tools/particles-effects/feel-183370)、[A* Pathfinding](https://assetstore.unity.com/packages/tools/behavior-ai/a-pathfinding-project-pro-87744) 及 [Dialogue System](https://assetstore.unity.com/packages/tools/behavior-ai/dialogue-system-for-unity-11672)。
