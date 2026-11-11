// PM2 設定：讓網站在背景常駐、當機自動重啟、開機自動啟動。
// 用法（在專案根目錄）：pm2 start deploy/ecosystem.config.cjs
const path = require("node:path");

module.exports = {
  apps: [
    {
      name: "unity-packages",
      cwd: path.resolve(__dirname, ".."),
      script: "server/index.js",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production" },
      max_memory_restart: "400M",
      restart_delay: 3000,
      time: true,
    },
  ],
};
