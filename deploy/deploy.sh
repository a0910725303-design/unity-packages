#!/usr/bin/env bash
# 更新網站：在 VPS 的專案資料夾執行
#   bash deploy/deploy.sh
# 會：拉最新程式 → 安裝相依 → 建置前端 → 更新資料表 → 無停機重啟。
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "找不到 .env，請先：cp .env.production.example .env 並填寫"; exit 1
fi

if [ -d .git ]; then
  echo "==> 取得最新程式"
  git pull --ff-only
fi

echo "==> 安裝相依套件"
npm ci --include=dev --no-audit --no-fund

echo "==> 建置前端"
npm run build

echo "==> 更新資料表（不會刪除既有資料）"
npm run db:setup

echo "==> 重新啟動網站"
if pm2 describe unity-packages >/dev/null 2>&1; then
  pm2 reload unity-packages --update-env
else
  pm2 start deploy/ecosystem.config.cjs
fi
pm2 save

sleep 2
if curl -fsS http://127.0.0.1:${PORT:-3001}/api/health >/dev/null; then
  echo "✓ 網站運作正常"
else
  echo "✗ 健康檢查失敗，請查看：pm2 logs unity-packages --lines 50"; exit 1
fi
