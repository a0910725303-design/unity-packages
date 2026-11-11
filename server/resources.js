import { packageKey } from "./showcases.js";

// Files stay outside public/ and dist/. Only the authenticated download route serves them.
export const resources = [
  {
    id: "rpg-inventory",
    fileName: "rpg-inventory.md",
    title: "RPG 物品欄原型製作指南",
    summary:
      "從拾取、堆疊與裝備欄開始，完成商店、合成和存讀檔的小型 RPG 原型。",
    contents: [
      "道具與存檔資料規格",
      "兩套物品欄的選用分工",
      "分階段 AI 實作提示與驗收",
    ],
    packageKeys: ["asset-store:166053", "asset-store:95550"],
  },
  {
    id: "branching-story",
    fileName: "branching-story.md",
    title: "分支敘事 RPG 製作指南",
    summary:
      "製作一段可探索、交談與推理的原創故事，讓角色記住玩家選擇並產生不同結局。",
    contents: [
      "原創故事與分支表",
      "Dialogue System／ink 路線",
      "對話、條件、存檔驗收清單",
    ],
    packageKeys: ["asset-store:11672", "github:inkle/ink"],
  },
  {
    id: "tactical-prototype",
    fileName: "tactical-prototype.md",
    title: "回合戰術遊戲原型製作指南",
    summary:
      "以雙角色護送任務練習移動、行動點與敵人回合，搭配編輯工具和尋路套件。",
    contents: [
      "棋盤、回合與行動規則",
      "Odin、A*、DOTween 的分工",
      "垂直切片與邊界條件測試",
    ],
    packageKeys: [
      "asset-store:89041",
      "asset-store:87744",
      "asset-store:27676",
    ],
  },
  {
    id: "game-feel",
    fileName: "game-feel.md",
    title: "操作回饋小遊戲製作指南",
    summary:
      "做一個收集能量、躲避障礙的小遊戲，用 Feel 組合音效、縮放、粒子與鏡頭回饋。",
    contents: [
      "完整的小遊戲循環",
      "可調整的回饋事件表",
      "減少動態效果與效能驗收",
    ],
    packageKeys: [
      "asset-store:183370",
      "unity:com.unity.render-pipelines.universal",
    ],
  },
];

export const resourceMetadata = ({ fileName, ...entry }) => ({
  ...entry,
  format: "Markdown",
  free: true,
});
export const getResources = (p) =>
  resources
    .filter((r) => r.packageKeys.includes(packageKey(p)))
    .map(resourceMetadata);
