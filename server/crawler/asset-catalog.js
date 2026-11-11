import { catalog } from "../catalog.js";

// Crawler additions live separately from bootstrap seeds, so db:setup cannot
// recreate an imported package under a different slug on a later run.
export const assetStoreCatalog = [
  {
    slug: "ultimate-inventory-system",
    url: "https://assetstore.unity.com/packages/tools/game-toolkits/ultimate-inventory-system-166053",
    category: "systems",
    summary:
      "建立 RPG 物品欄、裝備欄與拖放介面，搭配道具堆疊、商店、合成及存讀檔流程。",
    tags: [
      "物品欄",
      "背包",
      "裝備欄",
      "RPG",
      "UI 介面",
      "拖放",
      "堆疊",
      "商店",
      "合成",
      "存檔",
    ],
    editorialSource:
      "https://opsive.com/support/documentation/ultimate-inventory-system/",
  },
  {
    slug: "inventory-engine",
    url: "https://assetstore.unity.com/packages/tools/gui/inventory-engine-95550",
    category: "systems",
    summary:
      "建立背包、裝備欄、倉庫與快捷列，處理道具拾取、使用、堆疊及存讀檔；可搭配 TopDown／Corgi Engine。",
    tags: [
      "物品欄",
      "背包",
      "裝備欄",
      "RPG",
      "UI 介面",
      "堆疊",
      "快捷列",
      "倉庫",
      "存檔",
      "TopDown Engine",
      "Corgi Engine",
    ],
    editorialSource: "https://inventory-engine.moremountains.com/",
  },
  ...catalog,
];
