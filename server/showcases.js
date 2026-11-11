// Curated primary-source evidence. Crawling package metadata never replaces these records.
export const showcases = [
  {
    id: "uis-village",
    packageKey: "asset-store:166053",
    kind: "demo",
    title: "Ultimate Inventory System 村莊示範",
    creator: "Opsive",
    summary:
      "從背包操作走到商店、合成與裝備切換，直接看 RPG 物品資料如何串起遊戲互動。",
    highlights: [
      "開啟背包、裝備武器，觀察道具在不同欄位間移動。",
      "走訪村莊商店與合成區，觀察貨幣、材料與背包同步變化。",
    ],
    evidence: {
      label: "Opsive 官方 Demo Scene 文件",
      url: "https://opsive.com/support/documentation/ultimate-inventory-system/getting-started/demo-scene/",
      note: "官方逐段說明這個示範的 Inventory、UI、商店、合成和拾取流程。這是套件示範場景。",
    },
    links: [
      {
        label: "開啟網頁試玩",
        url: "https://opsive.com/demos/ultimate-inventory-system-demo/",
      },
      {
        label: "觀看操作影片與說明",
        url: "https://opsive.com/support/documentation/ultimate-inventory-system/getting-started/demo-scene/",
      },
    ],
  },
  {
    id: "inventory-pixelrogue",
    packageKey: "asset-store:95550",
    kind: "demo",
    title: "PixelRogue 物品欄示範",
    creator: "More Mountains",
    summary:
      "像素角色搭配背包、雙人獨立物品欄與武器快捷列，適合對照 RPG 的基本操作。",
    highlights: [
      "PixelRogue 1／2 展示背包介面與跨場景保留物品。",
      "Multiplayer 展示兩名角色各自的背包；WeaponBar 展示拾取與快捷鍵換武器。",
    ],
    evidence: {
      label: "Inventory Engine 官方場景清單",
      url: "https://inventory-engine-docs.moremountains.com/contents.html",
      note: "官方列出 PixelRogue 系列示範的功能與操作。示範場景隨套件提供，影片可直接觀看。",
    },
    links: [
      {
        label: "觀看官方介紹影片",
        url: "https://www.youtube.com/watch?v=cDqoynSEwoo",
      },
      {
        label: "查看場景與操作說明",
        url: "https://inventory-engine-docs.moremountains.com/contents.html",
      },
    ],
  },
  {
    id: "dotween-superhot",
    packageKey: "asset-store:27676",
    kind: "game",
    title: "SUPERHOT",
    creator: "SUPERHOT Team",
    summary:
      "以時間與動作節奏為特色的射擊作品，收錄在 DOTween 官方使用案例名單。",
    highlights: [
      "從遊戲官網進入商店查看實機畫面與預告。",
      "可作為補間工具用於正式作品的參考；官方名單未逐一公開使用 DOTween 的畫面或功能。",
    ],
    evidence: {
      label: "DOTween 官方 Showcase",
      url: "https://dotween.demigiant.com/showcase.php",
      note: "作者明確將 SUPERHOT 列為使用 DOTween 的遊戲；未說明具體模組或套件版本。",
    },
    links: [{ label: "查看遊戲與實機畫面", url: "https://superhotgame.com/" }],
  },
  {
    id: "odin-phantom-brigade",
    packageKey: "asset-store:89041",
    kind: "game",
    title: "Phantom Brigade",
    creator: "Brace Yourself Games",
    summary:
      "機甲戰術遊戲的開發訪談，展示如何用 Odin 整理複雜資料與 UI 元件的編輯流程。",
    highlights: [
      "看訪談中的 Inspector 截圖，理解條件欄位如何簡化資料編輯。",
      "對照遊戲的機甲裝備與戰術介面；Odin 的已確認用途是開發工具與資料配置。",
    ],
    evidence: {
      label: "Odin 官方開發團隊訪談",
      url: "https://odininspector.com/blog/brace-yourself-games-phantom-brigade",
      note: "團隊具體說明使用 property resolvers、條件屬性與資料警告建立編輯工具。",
    },
    links: [
      {
        label: "查看遊戲畫面",
        url: "https://braceyourselfgames.com/phantom-brigade/",
      },
      {
        label: "看開發流程與截圖",
        url: "https://odininspector.com/blog/brace-yourself-games-phantom-brigade",
      },
    ],
  },
  {
    id: "feel-chill-snake",
    packageKey: "asset-store:183370",
    kind: "game",
    title: "Chill Snake",
    creator: "More Mountains",
    summary:
      "已上架的輕鬆貪食蛇小遊戲，可以觀察簡單玩法如何搭配操作、音樂與細節回饋。",
    highlights: [
      "查看商店截圖，對照單點操作的小遊戲設計。",
      "官方說明 Feel 附帶此作品的程式與內容，可進一步研究微互動的組合。",
    ],
    evidence: {
      label: "Feel 官方作品介紹",
      url: "https://feel.moremountains.com/",
      note: "More Mountains 明確說明 Chill Snake 由 Feel 驅動，並提供 App Store 入口。",
    },
    links: [
      {
        label: "查看 App Store 作品",
        url: "https://apps.apple.com/mt/app/chill-snake/id1557131251",
      },
    ],
  },
  {
    id: "feel-playground",
    packageKey: "asset-store:183370",
    kind: "demo",
    title: "Feel 互動示範集",
    creator: "More Mountains",
    summary: "從小型回饋場景到完整小遊戲，直接試看同一個動作加入回饋後的表現。",
    highlights: [
      "比較畫面震動、縮放與粒子等不同回饋的觀感。",
      "搭配官方介紹查看更多示範；WebGL 的音訊、觸覺等展示有平台限制。",
    ],
    evidence: {
      label: "Feel 官方 Demo 說明",
      url: "https://feel.moremountains.com/",
      note: "官方提供網頁示範集與桌面版入口，並說明網頁展示的限制。",
    },
    links: [
      {
        label: "開啟網頁試玩",
        url: "https://feel.moremountains.com/assets/resources/feel/builds/HTML/index.html",
      },
      { label: "查看示範介紹", url: "https://feel.moremountains.com/" },
    ],
  },
  {
    id: "dialogue-disco-elysium",
    packageKey: "asset-store:11672",
    kind: "game",
    title: "Disco Elysium",
    creator: "ZA/UM",
    summary:
      "以大量文字與角色對話推進的偵探 RPG，適合研究分支敘事在完整遊戲中的呈現。",
    highlights: [
      "觀察角色交談、選項與文字資訊如何形成遊戲節奏。",
      "作者確認的工具流程是 articy:draft 搭配 Dialogue System；其他玩法系統另需實作。",
    ],
    evidence: {
      label: "Pixel Crushers 作者 Tony Li 的說明",
      url: "https://forum.pixelcrushers.com/post/whats-the-easiest-text-tool-for-importing-to-dialogue-system-13719656",
      note: "Dialogue System 作者在官方論壇明確舉出 Disco Elysium 使用 articy:draft 與 Dialogue System。",
    },
    links: [{ label: "查看遊戲與畫面", url: "https://discoelysium.com/" }],
  },
  {
    id: "ink-heavens-vault",
    packageKey: "github:inkle/ink",
    kind: "game",
    title: "Heaven’s Vault",
    creator: "inkle",
    summary:
      "以考古與語言解讀為主題的冒險遊戲，故事會記住玩家的選擇與探索路線。",
    highlights: [
      "觀察探索順序與角色對話的關聯。",
      "閱讀官方 Adaptive narrative 段落，了解 ink 如何支援依選擇變化的故事。",
    ],
    evidence: {
      label: "inkle 遊戲官方介紹",
      url: "https://www.inklestudios.com/heavensvault/",
      note: "開發者在遊戲頁直接說明使用 ink 敘事語言，使故事記住並回應玩家選擇。",
    },
    links: [
      {
        label: "查看遊戲與敘事介紹",
        url: "https://www.inklestudios.com/heavensvault/",
      },
    ],
  },
  {
    id: "ink-intercept",
    packageKey: "github:inkle/ink",
    kind: "demo",
    title: "The Intercept",
    creator: "inkle",
    summary:
      "以審問為情境的短篇互動故事，提供遊戲下載、ink 劇本與完整 Unity 專案。",
    highlights: [
      "先體驗不同回答，再對照劇本中的分支與條件。",
      "從完整專案研究 Unity 如何顯示文字、建立選項並推進 ink 故事。",
    ],
    evidence: {
      label: "inkle 官方示範介紹",
      url: "https://www.inklestudios.com/ink/theintercept/",
      note: "官方明確標示這是以 ink 與 Unity 製作的短篇示範遊戲，並公開完整原始碼。",
    },
    links: [
      {
        label: "查看示範與下載入口",
        url: "https://www.inklestudios.com/ink/theintercept/",
      },
      { label: "閱讀完整專案", url: "https://github.com/inkle/the-intercept" },
    ],
  },
  {
    id: "astar-darkwood",
    packageKey: "asset-store:87744",
    kind: "game",
    title: "Darkwood",
    creator: "Acid Wizard Studio",
    summary:
      "俯視角生存恐怖遊戲，開發者分享如何擴充尋路邏輯，讓 AI 考慮照明區域。",
    highlights: [
      "看實機場景中角色移動與光暗區域的關係。",
      "閱讀官方收錄的團隊說明，了解尋路套件如何與遊戲特有的照明邏輯配合。",
    ],
    evidence: {
      label: "A* Pathfinding 官方案例與團隊心得",
      url: "https://arongranberg.com/astar/",
      note: "作者頁收錄 Darkwood 團隊對尋路與照明邏輯擴充的說明；未列明當時的套件版本或授權方案。",
    },
    links: [
      {
        label: "觀看 Steam 實機畫面",
        url: "https://store.steampowered.com/app/274520/Darkwood/",
      },
    ],
  },
  {
    id: "astar-cult-of-the-lamb",
    packageKey: "asset-store:87744",
    kind: "game",
    title: "Cult of the Lamb",
    creator: "Massive Monster",
    summary:
      "結合聚落經營與戰鬥探索的作品，列在 A* Pathfinding Project 官方遊戲案例中。",
    highlights: [
      "從商店影片與截圖觀察聚落角色活動與戰鬥場景。",
      "官方可確認套件使用關係，但未拆解每一類角色採用的導航設定。",
    ],
    evidence: {
      label: "A* Pathfinding 官方遊戲案例",
      url: "https://arongranberg.com/astar/",
      note: "作者頁收錄 Cult of the Lamb 與團隊推薦語；未公開具體版本、方案或所有 AI 實作細節。",
    },
    links: [
      {
        label: "查看遊戲與預告",
        url: "https://store.steampowered.com/app/1313140/",
      },
    ],
  },
  {
    id: "urp-boat-attack",
    packageKey: "unity:com.unity.render-pipelines.universal",
    kind: "demo",
    title: "Boat Attack",
    creator: "Unity Technologies",
    summary:
      "以賽艇為主題的官方示範專案，展示 URP 水面、反射與場景渲染的組合。",
    highlights: [
      "查看 README 的示範影片入口，觀察水面與島嶼場景。",
      "研究專案中的平面反射與 WaterFX；執行前依專案指定版本選擇分支。",
    ],
    evidence: {
      label: "Unity 官方 BoatAttack 專案",
      url: "https://github.com/Unity-Technologies/BoatAttack",
      note: "README 明確將專案定位為 Universal RP 的開發與測試示範，並列出渲染功能。",
    },
    links: [
      {
        label: "查看畫面、影片入口與原始碼",
        url: "https://github.com/Unity-Technologies/BoatAttack",
      },
    ],
  },
];

export function packageKey(p) {
  if (p.source_key) return p.source_key;
  // Bootstrap catalog entries may not have been crawled yet. Match only official product IDs.
  try {
    const url = new URL(p.official_url);
    const id =
      url.hostname === "assetstore.unity.com" &&
      url.pathname.match(/^\/packages\/.+-(\d+)\/?$/)?.[1];
    return id ? `asset-store:${id}` : null;
  } catch {
    return null;
  }
}

export const getShowcases = (p) =>
  showcases.filter((s) => s.packageKey === packageKey(p));
export function showcaseCounts(p) {
  const entries = getShowcases(p);
  return {
    showcase_count: entries.length,
    game_count: entries.filter((s) => s.kind === "game").length,
    demo_count: entries.filter((s) => s.kind === "demo").length,
  };
}
