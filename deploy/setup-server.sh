#!/usr/bin/env bash
# VPS 初次安裝（Ubuntu 22.04 / 24.04），只需執行一次：
#   sudo bash deploy/setup-server.sh
# 會安裝：Node.js 22、PM2、MySQL、Nginx、Certbot，並開啟防火牆 22/80/443。
set -euo pipefail

if [ "$(id -u)" -ne 0 ]; then
  echo "請用 sudo 執行：sudo bash deploy/setup-server.sh"; exit 1
fi

echo "==> 更新系統套件"
apt-get update
apt-get upgrade -y
apt-get install -y ca-certificates curl gnupg git ufw

echo "==> 安裝 Node.js 22 LTS"
if ! command -v node >/dev/null || ! node -v | grep -q '^v22'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v && npm -v

echo "==> 安裝 PM2（背景常駐 Node.js）"
npm install -g pm2

echo "==> 安裝 MySQL、Nginx、Certbot"
apt-get install -y mysql-server nginx certbot python3-certbot-nginx
systemctl enable --now mysql nginx

echo "==> 小記憶體主機：若沒有 swap 就建立 1GB，避免建置時記憶體不足"
if ! swapon --show | grep -q .; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo "==> 防火牆：只開 SSH、HTTP、HTTPS（MySQL 3001 都不對外）"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo
echo "完成！接下來請依 DEPLOY.md 第 4 步建立資料庫。"
