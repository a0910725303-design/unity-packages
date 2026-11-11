# 部署到 unity.nestw.net（VPS 版）

這份說明會把網站架在你自己的 VPS 上，網址是 **https://unity.nestw.net**。
從頭到尾大約 30～60 分鐘，照順序做即可。

```text
瀏覽器 ──HTTPS──▶ Nginx (80/443，自動憑證)
                   │
                   ▼
              Node.js / Express (127.0.0.1:3001，PM2 常駐)
                   │  ├─ /api/*  會員、論壇、套件 API
                   │  └─ 其他    React 網站（dist/）
                   ▼
              MySQL (127.0.0.1:3306，只有本機能連)
```

需要準備：

- 一台 VPS：Ubuntu 22.04 或 24.04，記憶體 1GB 以上（建議 2GB）。
- 能用 SSH 登入 VPS 的帳號（Windows 可直接在 PowerShell 用 `ssh`）。
- `nestw.net` 網域的 DNS 管理後台登入資訊。

以下 `你的VPS_IP`、`你的帳號` 請換成實際值。

---

## 1. 設定子網域 DNS

到 `nestw.net` 的 DNS 管理處（網域商後台或 Cloudflare），新增一筆記錄：

| 類型 | 名稱 / 主機 | 值 / 指向 | TTL |
| --- | --- | --- | --- |
| A | `unity` | `你的VPS_IP` | 自動 |

- 若使用 **Cloudflare**：先把那朵雲設成**灰色（DNS only）**，等第 7 步 HTTPS 申請成功後再決定要不要開橘色。開橘色時，SSL/TLS 模式要選 **Full (strict)**。
- 若 VPS 有 IPv6，可再加一筆 `AAAA` 記錄。

在自己電腦的 PowerShell 檢查（通常幾分鐘內生效）：

```powershell
nslookup unity.nestw.net
```

看到你的 VPS IP 就完成了。

## 2. 把程式放上 VPS

### 方法 A：GitHub 私人倉庫（推薦，之後更新最方便）

在 `D:\Unity網站分享` 開 PowerShell：

```powershell
git init
git add .
git commit -m "Unity 套件網站"
git branch -M main
git remote add origin https://github.com/你的帳號/unity-packages.git
git push -u origin main
```

`.gitignore` 已設定好，**不會**上傳 `.env`、`AGENTS.md`（內含本機 MySQL 密碼）、`node_modules/`、`codex/`、`example/`。
推送前可用 `git status` 確認清單裡沒有這些檔案。

接著 SSH 進 VPS：

```bash
ssh 你的帳號@你的VPS_IP
sudo mkdir -p /var/www/unity-packages
sudo chown $USER:$USER /var/www/unity-packages
git clone https://github.com/你的帳號/unity-packages.git /var/www/unity-packages
cd /var/www/unity-packages
```

（私人倉庫 clone 時要輸入 GitHub 帳號與 Personal Access Token。）

### 方法 B：直接打包上傳（不用 Git）

在 `D:\Unity網站分享` 的 PowerShell：

```powershell
tar -czf unity.tgz --exclude=node_modules --exclude=dist --exclude=codex --exclude=example --exclude=.env --exclude=AGENTS.md .
scp unity.tgz 你的帳號@你的VPS_IP:~/
```

在 VPS：

```bash
sudo mkdir -p /var/www/unity-packages
sudo chown $USER:$USER /var/www/unity-packages
tar -xzf ~/unity.tgz -C /var/www/unity-packages
cd /var/www/unity-packages
```

## 3. 安裝伺服器環境（只做一次）

```bash
cd /var/www/unity-packages
sudo bash deploy/setup-server.sh
```

會安裝 Node.js 22、PM2、MySQL、Nginx、Certbot，並開防火牆（只開放 SSH、80、443；MySQL 和 3001 不對外）。

## 4. 建立資料庫與專用帳號（只做一次）

先改密碼，再執行：

```bash
nano deploy/mysql-setup.sql     # 把兩處「請改成強密碼」換成同一組新密碼，Ctrl+O 存檔、Ctrl+X 離開
sudo mysql < deploy/mysql-setup.sql
```

> 正式站**不要用 root**，也不要沿用本機的密碼。

## 5. 填寫正式環境設定 `.env`

```bash
cp .env.production.example .env
openssl rand -hex 48            # 產生一串隨機字，複製起來
nano .env
```

需要改的只有兩項：

- `SESSION_SECRET=` 貼上剛剛產生的隨機字串
- `DB_PASSWORD=` 填第 4 步設定的資料庫密碼

`APP_ORIGIN=https://unity.nestw.net` 已經填好，網址要和瀏覽器上看到的完全一致（結尾不要加 `/`）。

## 6. （建議）把本機的資料搬上去

本機已經有爬好的 154 個套件，以及你註冊過的會員和文章。要沿用的話：

**在 Windows 匯出**（MySQL 8 的路徑如下；若是 MariaDB，換成 `C:\Program Files\MariaDB 11.x\bin\mysqldump.exe`）：

```powershell
cd D:\Unity網站分享
& "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqldump.exe" -u root -p `
  --single-transaction --no-tablespaces --default-character-set=utf8mb4 `
  --ignore-table=unity_packages.sessions `
  --result-file=unity_packages.sql unity_packages
scp unity_packages.sql 你的帳號@你的VPS_IP:~/
```

> 一定要用 `--result-file`，不要用 `>` 導出。PowerShell 的 `>` 會把檔案存成 UTF-16，中文會變亂碼。

**在 VPS 匯入：**

```bash
mysql -u unity_app -p unity_packages < ~/unity_packages.sql
rm ~/unity_packages.sql
```

不搬資料也可以，下一步會自動建立 8 個起始套件與 10 篇站方文章。

## 7. 啟動網站

```bash
cd /var/www/unity-packages
bash deploy/deploy.sh
```

最後看到 `✓ 網站運作正常` 就代表 Node.js 已經在跑了。設定開機自動啟動：

```bash
pm2 startup        # 會印出一行 sudo 開頭的指令，複製貼上執行
pm2 save
```

## 8. 接上 Nginx 與 HTTPS

```bash
sudo cp deploy/nginx/unity.nestw.net.conf /etc/nginx/sites-available/unity.nestw.net
sudo ln -s /etc/nginx/sites-available/unity.nestw.net /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d unity.nestw.net
```

Certbot 會問 email 與同意條款，完成後自動設定好 HTTPS 憑證、HTTP 轉 HTTPS，並且會自動續約。

## 9. 上線檢查

打開 **https://unity.nestw.net**，確認：

- [ ] 網址列有鎖頭，首頁正常顯示
- [ ] 註冊一個新帳號 → 自動登入（代表 cookie、HTTPS、資料庫都正常）
- [ ] 重新整理後仍是登入狀態
- [ ] 點進任一套件，網址是 `/packages/數字`，重新整理後仍在同一頁
- [ ] 舊網址 `https://unity.nestw.net/#/packages` 會自動轉到 `/packages`
- [ ] https://unity.nestw.net/sitemap.xml 有列出套件網址

可以到 [Google Search Console](https://search.google.com/search-console) 加入網站並提交 `sitemap.xml`，讓 Google 收錄。

## 10. 定時備份（建議）

```bash
bash deploy/backup-db.sh        # 先手動跑一次，確認 ~/backups 有檔案
crontab -e                      # 加入下面這行（每天 03:30 備份，保留 14 天）
30 3 * * * /bin/bash /var/www/unity-packages/deploy/backup-db.sh >> $HOME/unity-backup.log 2>&1
```

還原備份：`gunzip -c ~/backups/檔名.sql.gz | mysql -u unity_app -p unity_packages`，再跑一次 `npm run db:setup`（補回登入 session 資料表）。

---

## 日後更新網站

在本機改完、測試後：

```powershell
git add .
git commit -m "說明這次改了什麼"
git push
```

再到 VPS：

```bash
cd /var/www/unity-packages
bash deploy/deploy.sh
```

（用方法 B 的話，重新打包上傳、解壓覆蓋後，同樣執行 `bash deploy/deploy.sh`。）

## 常用指令

| 要做的事 | 指令 |
| --- | --- |
| 看網站狀態 | `pm2 status` |
| 看錯誤紀錄 | `pm2 logs unity-packages --lines 100` |
| 重新啟動 | `pm2 restart unity-packages` |
| 改了 `.env` 之後 | `pm2 reload unity-packages --update-env` |
| 檢查 Nginx 設定 | `sudo nginx -t` |
| 看 Nginx 錯誤 | `sudo tail -n 50 /var/log/nginx/error.log` |
| 測試憑證續約 | `sudo certbot renew --dry-run` |

## 疑難排解

| 狀況 | 原因與處理 |
| --- | --- |
| 打開網址顯示 **502 Bad Gateway** | Node.js 沒在跑。`pm2 logs unity-packages` 看錯誤，多半是 `.env` 的資料庫密碼錯。 |
| 登入、發文顯示「**不允許的請求來源**」 | `.env` 的 `APP_ORIGIN` 和瀏覽器網址不一致（http/https、有沒有 www、結尾多了 `/`）。改完執行 `pm2 reload unity-packages --update-env`。 |
| 登入成功但**一重新整理就登出** | 還沒裝 HTTPS（正式模式的 cookie 只走 HTTPS），或 `.env` 沒有 `TRUST_PROXY=1`。 |
| certbot 失敗 | DNS 還沒生效（`nslookup unity.nestw.net` 確認），或 Cloudflare 開了橘色雲，先切灰色再試。 |
| `npm run build` 被系統終止 | 記憶體不足。`setup-server.sh` 已建立 1GB swap；仍不足時把 VPS 升到 2GB。 |
| 匯入資料出現 collation 錯誤 | 本機是 MariaDB、VPS 是 MySQL 時可能發生。把錯誤訊息貼給我，我幫你轉換。 |
