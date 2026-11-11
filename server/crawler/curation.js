import { assetStoreCatalog } from "./asset-catalog.js";

// Editorial descriptions, written after inspecting the crawler's source records.
// New discoveries without a reviewed entry stay in pendingReview, not in the site.
const unity = {
  "2d.animation": [
    "animation",
    "2D,動畫系統,骨架",
    "為 Sprite 建立骨架動畫，處理 2D 角色綁定與動畫播放。",
  ],
  "2d.aseprite": [
    "art",
    "2D,像素美術,Aseprite",
    "將 Aseprite 像素美術檔案匯入 Unity，銜接繪圖與遊戲製作流程。",
  ],
  "2d.pixel-perfect": [
    "art",
    "2D,像素美術,相機",
    "透過 Pixel Perfect Camera 處理不同解析度下的像素畫面顯示。",
  ],
  "2d.psdimporter": [
    "art",
    "2D,Photoshop,角色",
    "匯入 Photoshop PSB 圖層素材，搭配 2D Animation 製作角色動畫。",
  ],
  "2d.spriteshape": [
    "art",
    "2D,場景,曲線",
    "以曲線與 Sprite 建立可編輯的 2D 地形輪廓及場景形狀。",
  ],
  "2d.tilemap.extras": [
    "art",
    "2D,Tilemap,關卡",
    "補充 Tilemap 的圖塊與筆刷工具，協助製作規則圖塊及地圖。",
  ],
  "2d.tooling": [
    "tools",
    "2D,效能優化,圖集",
    "在編輯器中分析 Sprite Atlas 的使用情況，檢查 2D 素材配置。",
  ],
  addressables: [
    "tools",
    "資源管理,載入,AssetBundle",
    "以位址管理、建置與非同步載入遊戲資源，整理內容分組及相依關係。",
  ],
  "addressables.android": [
    "tools",
    "Android,資源管理,發佈",
    "搭配 Addressables 將資源分組打包為 Android asset packs，串接 Play Asset Delivery。",
  ],
  "services.levelplay": [
    "systems",
    "廣告,營運,LevelPlay",
    "整合 LevelPlay 廣告中介服務；使用前需建立服務帳號並設定廣告格式。",
  ],
  "ai.navigation": [
    "systems",
    "AI 與尋路,NavMesh,NPC",
    "在編輯或執行階段建立導航網格，處理角色尋路與場景導航。",
  ],
  "formats.alembic": [
    "animation",
    "動畫系統,Alembic,匯入匯出",
    "匯入、匯出及錄製 Alembic 動畫資料，銜接動畫製作工具。平台限制請查看文件。",
  ],
  "services.analytics": [
    "systems",
    "營運,數據分析,事件",
    "收集遊戲事件與玩家操作資料，支援自訂事件分析遊戲流程。",
  ],
  "mobile.android-logcat": [
    "tools",
    "除錯,Android,日誌",
    "在 Unity 中查看 Android 日誌、記憶體資訊與畫面擷取，協助裝置除錯。",
  ],
  "animation.rigging": [
    "animation",
    "動畫系統,IK 反向運動,角色",
    "運用 Animation C# Jobs 建立角色約束與程序化綁定流程。",
  ],
  "xr.arkit": [
    "systems",
    "AR,XR,iOS",
    "為 Unity XR 提供 Apple ARKit 整合，建立 Apple 平台擴增實境功能。",
  ],
  "xr.visionos": [
    "systems",
    "XR,visionOS,空間運算",
    "提供 Apple visionOS 的 XR 功能與建置支援，銜接平台子系統。",
  ],
  "xr.arfoundation": [
    "systems",
    "AR,XR,跨平台",
    "以統一介面建立跨平台擴增實境應用，搭配各平台的 XR 外掛。",
  ],
  "asset-manager-for-unity": [
    "tools",
    "資源管理,Unity Cloud,協作",
    "在 Unity 編輯器中瀏覽、上傳及匯入 Unity Cloud 的專案資產。",
  ],
  "ai.assistant": [
    "tools",
    "AI,編輯器擴充,開發輔助",
    "在編輯器中以自然語言提問及操作專案的 AI 工具；服務條件依官方說明。",
  ],
  "services.authentication": [
    "systems",
    "帳號,登入,UGS",
    "管理 Unity Gaming Services 的玩家身分，串接登入與身分提供者。",
  ],
  behavior: [
    "systems",
    "AI 與尋路,行為樹,NPC",
    "以圖形節點組織行為樹，建立角色移動、偵測與決策流程。",
  ],
  "services.cloud-build": [
    "tools",
    "建置,CI,雲端",
    "串接 Unity Build Automation，安排應用程式的雲端建置與分發。",
  ],
  burst: [
    "tools",
    "效能優化,DOTS,編譯",
    "透過 LLVM 將 IL/.NET 程式碼編譯為原生碼，支援運算效能最佳化。",
  ],
  "services.ccd.management": [
    "tools",
    "資源管理,雲端,內容分發",
    "管理 Cloud Content Delivery 的內容託管與分發，搭配資源更新流程。",
  ],
  charactercontroller: [
    "animation",
    "角色控制,DOTS,Entities",
    "提供以 Entities 為基礎的可自訂角色控制方案與角色範例。",
  ],
  cinemachine: [
    "animation",
    "相機,動畫系統,運鏡",
    "建立虛擬攝影機與遊戲運鏡流程；既有專案升級前請核對官方遷移文件。",
  ],
  "services.cloud-diagnostics": [
    "tools",
    "除錯,雲端,診斷",
    "蒐集應用程式在使用者裝置上發生的問題，協助分析執行階段異常。",
  ],
  "services.cloudsave": [
    "systems",
    "資料儲存,存檔,雲端",
    "將玩家進度與偏好存放於雲端，支援跨裝置的資料使用流程。",
  ],
  "services.apis": [
    "tools",
    "API,雲端,UGS",
    "提供 Unity Cloud 的底層 API 存取，支援管理端及用戶端整合。",
  ],
  "testtools.codecoverage": [
    "tools",
    "測試,程式品質,覆蓋率",
    "輸出測試覆蓋率資料與報告，也能錄製手動操作期間的程式涵蓋情況。",
  ],
  collections: [
    "tools",
    "DOTS,資料結構,效能優化",
    "提供可用於 Jobs 與 Burst 的 C# 集合及資料結構。",
  ],
  "dedicated-server": [
    "systems",
    "多人連線,伺服器,建置",
    "改善 Dedicated Server 平台的開發與建置流程，支援專用伺服器專案。",
  ],
  "services.deployment": [
    "tools",
    "部署,UGS,雲端",
    "提供 UGS 服務資產與設定的共用部署介面，供相關服務整合使用。",
  ],
  "device-simulator.devices": [
    "tools",
    "行動裝置,測試,模擬器",
    "為 Device Simulator 補充裝置定義與外觀，檢查不同裝置的畫面配置。",
  ],
  "services.economy": [
    "systems",
    "經濟系統,道具,UGS",
    "建立遊戲內貨幣、購買與玩家物品管理流程，串接雲端經濟服務。",
  ],
  editorcoroutines: [
    "tools",
    "編輯器擴充,協程,工作流程",
    "在 Unity 編輯器中執行類似 MonoBehaviour 協程的工作流程。",
  ],
  entities: [
    "systems",
    "DOTS,ECS,遊戲架構",
    "提供 Entity Component System 的系統與元件，建立資料導向遊戲架構。",
  ],
  "entities.graphics": [
    "art",
    "DOTS,渲染,LOD",
    "為 Entities 專案提供網格繪製系統，支援實例化渲染與細節層級。",
  ],
  "external-dependency-manager": [
    "tools",
    "Android,iOS,相依管理",
    "解析與管理原生外掛相依套件，整理 Android 及 iOS 程式庫。",
  ],
  "meta-instant-games-sdk": [
    "systems",
    "Web,Facebook,平台整合",
    "以 C# 綁定 Facebook Instant Games SDK，串接網頁遊戲平台功能。",
  ],
  "formats.fbx": [
    "art",
    "3D,FBX,匯入匯出",
    "匯出模型、燈光、攝影機與動畫資料，銜接 Unity 與外部 3D 製作工具。",
  ],
  "services.friends": [
    "systems",
    "社交,好友,UGS",
    "處理好友邀請與好友清單，為遊戲加入玩家社交功能。",
  ],
  "xr.arcore": [
    "systems",
    "AR,XR,Android",
    "為 Unity XR 提供 Google ARCore 整合，建立 Android 擴增實境功能。",
  ],
  purchasing: [
    "systems",
    "內購,營運,商店",
    "以共用 API 處理應用程式內購，銜接 Apple 與 Google 等平台商店。",
  ],
  inputsystem: [
    "systems",
    "輸入控制,手把,跨平台",
    "建立可擴充的輸入控制配置，整理玩家操作與不同輸入裝置。",
  ],
  "ads.ios-support": [
    "systems",
    "iOS,廣告,平台整合",
    "提供 iOS App Tracking Transparency 與 SKAdNetwork API 的整合工具。",
  ],
  "ide.rider": [
    "tools",
    "IDE,程式編輯,Rider",
    "整合 JetBrains Rider 與 Unity，支援專案檔產生與編輯器偵測。",
  ],
  "services.leaderboards": [
    "systems",
    "排行榜,競賽,UGS",
    "儲存、排序與排名玩家分數，建立遊戲排行榜。",
  ],
  localization: [
    "systems",
    "多語系,在地化,UI 介面",
    "管理不同語言及地區的文字與資源，建立遊戲在地化流程。",
  ],
  mathematics: [
    "tools",
    "數學,DOTS,運算",
    "提供 C# 向量型別與數學函式，使用接近 Shader 的語法處理運算。",
  ],
  memoryprofiler: [
    "tools",
    "效能優化,記憶體,分析",
    "分析引擎與專案的記憶體配置，協助定位資源使用與記憶體問題。",
  ],
  "microsoft.gdk": [
    "systems",
    "Microsoft,平台整合,GDK",
    "整合 Microsoft Game Development Kit；使用前需具備對應平台資格與 API。",
  ],
  "microsoft.gdk.tools": [
    "tools",
    "Microsoft,GDK,建置",
    "搭配 Microsoft GDK API 套件，提供平台開發流程工具。",
  ],
  "ml-agents": [
    "systems",
    "機器學習,AI 與尋路,角色",
    "在 Unity 環境中訓練智慧角色行為，研究遊戲及模擬中的機器學習。",
  ],
  "mobile.notifications": [
    "systems",
    "通知,Android,iOS",
    "安排行動裝置的一次性或重複本機通知，並提供 iOS 推播接收支援。",
  ],
  "services.moderation": [
    "systems",
    "社群管理,營運,UGS",
    "提供遊戲社群內容與互動管理工具，協助處理不當行為。",
  ],
  "multiplayer.playmode": [
    "tools",
    "多人連線,測試,編輯器擴充",
    "在同一開發裝置啟用多個編輯器執行實例，協助多人遊戲測試。",
  ],
  "services.multiplayer": [
    "systems",
    "多人連線,UGS,連線服務",
    "整合 Unity Gaming Services 的多人遊戲服務，建立玩家共同遊玩的流程。",
  ],
  "multiplayer.tools": [
    "tools",
    "多人連線,除錯,分析",
    "提供多人遊戲開發工具，改善連線功能的測試與分析流程。",
  ],
  netcode: [
    "systems",
    "多人連線,DOTS,Entities",
    "在 Entities 架構中建立高階網路同步系統，開發 DOTS 多人遊戲。",
  ],
  "xr.oculus": [
    "systems",
    "VR,XR,Oculus",
    "為 Oculus 裝置提供顯示與輸入整合，支援 XR 應用開發。",
  ],
  "xr.openxr": [
    "systems",
    "VR,AR,OpenXR",
    "透過 OpenXR 標準整合 XR 裝置，搭配 XR Plugin Management 啟用。",
  ],
  "test-framework.performance": [
    "tools",
    "測試,效能優化,量測",
    "擴充 Unity Test Framework，加入效能量測與測試環境資料收集。",
  ],
  platformtoolkit: [
    "systems",
    "跨平台,平台整合,API",
    "提供平台無關的系統 API 介面，搭配個別平台實作存取平台功能。",
  ],
  "services.playeraccounts": [
    "systems",
    "帳號,登入,UGS",
    "將 Unity Player Accounts 與 Unity Gaming Services 的玩家流程整合。",
  ],
  "polyspatial.extensions": [
    "systems",
    "XR,PolySpatial,空間運算",
    "補充 PolySpatial 的擴充功能；使用資格及授權方案依官方文件。",
  ],
  "polyspatial.visionos": [
    "systems",
    "XR,visionOS,PolySpatial",
    "整合 PolySpatial 與 visionOS 的共享及沉浸式渲染模式。",
  ],
  postprocessing: [
    "effects",
    "後製,相機,畫面效果",
    "將後製特效與影像濾鏡套用至攝影機，調整遊戲畫面表現。",
  ],
  probuilder: [
    "art",
    "3D,關卡,灰盒",
    "直接在 Unity 建立、編輯及貼圖幾何形狀，用於灰盒、關卡原型與碰撞網格。",
  ],
  "performance.profile-analyzer": [
    "tools",
    "效能優化,Profiler,分析",
    "分析與比較多個影格的 CPU Profiler 資料，定位效能差異。",
  ],
  "project-auditor": [
    "tools",
    "靜態分析,程式品質,效能優化",
    "檢查專案資源、設定與腳本，輸出診斷及建置相關報告。",
  ],
  "services.push-notifications": [
    "systems",
    "通知,推播,營運",
    "為遊戲加入推播服務，處理含圖片的通知及接收資料分析。",
  ],
  recorder: [
    "tools",
    "錄影,擷取,動畫系統",
    "在 Play Mode 擷取動畫、影片、圖片與音訊，製作展示或驗證素材。",
  ],
  "remote-config": [
    "systems",
    "遠端設定,營運,UGS",
    "從雲端調整功能開關、難度與活動設定，管理不同受眾的遊戲配置。",
  ],
  scriptablebuildpipeline: [
    "tools",
    "建置,AssetBundle,工作流程",
    "以 C# API 組織 AssetBundle 建置流程，支援自訂資源建置工作。",
  ],
  "ai.inference": [
    "systems",
    "AI,機器學習,推論",
    "匯入已訓練的神經網路模型，在應用程式中執行本機推論並串接遊戲資料。",
  ],
  "services.tooling": [
    "tools",
    "UGS,編輯器擴充,設定管理",
    "為 Unity Cloud 服務提供編輯器整合與設定即程式碼的工作流程。",
  ],
  "sharp-zip-lib": [
    "tools",
    "資料儲存,壓縮,檔案",
    "包裝 SharpZipLib 程式庫，供 Unity 專案處理壓縮檔案。",
  ],
  splines: [
    "art",
    "曲線,路徑,場景",
    "編輯曲線與路徑，沿路徑產生物件、建立移動軌跡或繪製形狀。",
  ],
  "sysroot.base": [
    "tools",
    "Linux,建置,工具鏈",
    "提供 Sysroot 與工具鏈所需的共用基礎套件。",
  ],
  "sdk.linux-arm64": [
    "tools",
    "Linux,ARM64,建置",
    "提供 Linux ARM64 Player 建置所需的系統程式庫與標頭。",
  ],
  "sdk.linux-x86_64": [
    "tools",
    "Linux,x64,建置",
    "提供 Linux x64 Player 建置使用的 Sysroot 系統環境。",
  ],
  "profiling.systemmetrics.mali": [
    "tools",
    "效能優化,Android,Mali",
    "讀取 ARM Mali 裝置的底層效能指標，支援開發及執行階段量測。",
  ],
  "terrain-tools": [
    "art",
    "地形與植被,場景,3D",
    "增加地形雕塑筆刷與工具，調整地形外觀及地形貼圖製作流程。",
  ],
  timeline: [
    "animation",
    "動畫系統,過場,音樂與音效",
    "編排電影式過場、玩法片段、音訊及粒子效果的時間序列。",
  ],
  "toolchain.linux-x86_64-linux": [
    "tools",
    "Linux,建置,工具鏈",
    "在 Linux x64 主機準備 Linux 目標的交叉編譯工具鏈。",
  ],
  "toolchain.macos-arm64-linux": [
    "tools",
    "Linux,macOS,建置",
    "在 ARM64 macOS 主機建立 Linux 目標的交叉編譯流程。",
  ],
  "toolchain.macos-x86_64-linux": [
    "tools",
    "Linux,macOS,建置",
    "在 x64 macOS 主機準備 Linux 目標的交叉編譯工具鏈。",
  ],
  "toolchain.win-arm64-linux": [
    "tools",
    "Linux,Windows,建置",
    "在 ARM64 Windows 主機建立 Linux 目標的交叉編譯流程。",
  ],
  "toolchain.win-x86_64-linux": [
    "tools",
    "Linux,Windows,建置",
    "在 x64 Windows 主機準備 Linux 目標的交叉編譯工具鏈。",
  ],
  "learn.iet-framework.authoring": [
    "tools",
    "教學,編輯器擴充,內容製作",
    "製作 Unity 編輯器內的互動式教學資產，搭配 Tutorial Framework 使用。",
  ],
  "learn.iet-framework": [
    "tools",
    "教學,編輯器擴充,入門",
    "在教學專案與範本中顯示互動式編輯器教學。",
  ],
  "xr.androidxr-openxr": [
    "systems",
    "XR,Android,OpenXR",
    "整合 Android XR 的 OpenXR 擴充，建立混合實境應用。",
  ],
  "xr.meta-openxr": [
    "systems",
    "XR,Quest,OpenXR",
    "整合 Meta 的 OpenXR 擴充，建立 Meta Quest 混合實境應用。",
  ],
  physics: [
    "systems",
    "物理,DOTS,ECS",
    "以 C# ECS 架構建立可自訂的物理模擬，供資料導向專案使用。",
  ],
  "profiling.core": [
    "tools",
    "效能優化,Profiler,量測",
    "提供程式碼量測標記與效能統計收集 API，建立自訂分析工具。",
  ],
  "collab-proxy": [
    "tools",
    "版本控制,協作,工作流程",
    "在 Unity 編輯器中使用 Unity Version Control；服務訂閱條件依官方說明。",
  ],
  transport: [
    "systems",
    "多人連線,網路,傳輸",
    "提供低階網路連線與資料傳輸介面，作為多人連線系統的基礎。",
  ],
  "services.user-reporting": [
    "tools",
    "除錯,回報,測試",
    "蒐集使用者及測試人員遇到的問題，建立應用程式問題回報流程。",
  ],
  visualscripting: [
    "tools",
    "視覺化程式,原型,遊戲邏輯",
    "透過節點圖設計遊戲行為，製作互動原型與視覺化邏輯。",
  ],
  "ide.visualstudio": [
    "tools",
    "IDE,程式編輯,Visual Studio",
    "整合 Visual Studio 與 Unity，產生專案檔及程式碼編輯所需資料。",
  ],
  "services.vivox": [
    "systems",
    "多人連線,語音,聊天",
    "串接託管式語音與文字聊天，讓玩家在遊戲中溝通。",
  ],
  "web.stripping-tool": [
    "tools",
    "Web,建置,效能優化",
    "最佳化 Unity Web 建置的程式碼大小，檢查輸出內容。",
  ],
  "connect.share": [
    "tools",
    "WebGL,發佈,作品展示",
    "建立 WebGL 版本並上傳至 Unity 網站，分享可遊玩的專案。",
  ],
  "xr.compositionlayers": [
    "systems",
    "XR,渲染,合成",
    "提供以 XR Provider 為基礎的合成圖層支援。",
  ],
  "xr.hands": [
    "systems",
    "XR,手部追蹤,互動",
    "提供跨平台手部追蹤子系統 API，搭配平台供應者實作使用。",
  ],
  "xr.interaction.toolkit": [
    "systems",
    "VR,AR,互動",
    "以元件建立 XR 的 3D 物件及 UI 互動，組織互動者與可互動物件。",
  ],
  "xr.management": [
    "tools",
    "XR,外掛管理,建置",
    "管理 XR 外掛的載入、初始化、設定與建置支援。",
  ],
  "2d.sprite": [
    "art",
    "2D,Sprite,素材",
    "透過 Sprite Editor 編輯圖像的軸心、邊框及物理形狀。",
  ],
  "2d.tilemap": [
    "art",
    "2D,Tilemap,關卡",
    "使用 Tilemap 編輯器組織圖塊，建立格狀地圖與 2D 關卡。",
  ],
  adaptiveperformance: [
    "tools",
    "效能優化,行動裝置,視覺化程式",
    "提供 Adaptive Performance 的範例及視覺化程式節點；Unity 6.3 起主要功能整合至引擎。",
  ],
  "adaptiveperformance.google.android": [
    "tools",
    "效能優化,Android,行動裝置",
    "提供 Android 的 Adaptive Performance 子系統，配合效能調整流程。",
  ],
  "render-pipelines.high-definition": [
    "art",
    "HDRP,渲染,材質與光影",
    "以高畫質渲染管線處理光照與材質，建立需要進階圖形功能的畫面。",
  ],
  "multiplayer.center": [
    "tools",
    "多人連線,入門,開發輔助",
    "集中多人遊戲相關套件、範例與文件，協助選擇開發起點。",
  ],
  "render-pipelines.core": [
    "art",
    "SRP,渲染,Shader",
    "提供可重用的渲染程式與工具，協助建立或自訂 Scriptable Render Pipeline。",
  ],
  shadergraph: [
    "effects",
    "Shader,材質與光影,視覺化程式",
    "透過節點編輯材質 Shader，建立可視化的表面與畫面效果。",
  ],
  "test-framework": [
    "tools",
    "測試,程式品質,自動化",
    "執行 Edit Mode 與 Play Mode 測試，驗證遊戲及編輯器程式行為。",
  ],
  ugui: [
    "systems",
    "UI 介面,選單,GameObject",
    "以 GameObject 與元件建立、排列及設定遊戲的使用者介面。",
  ],
  "ui.test-framework": [
    "tools",
    "UI 介面,測試,自動化",
    "為 UI Toolkit 提供 Edit Mode 與 Play Mode 測試工具。",
  ],
  "rendering.denoising": [
    "art",
    "渲染,去雜訊,光照",
    "提供共用去雜訊 API，供路徑追蹤、光照貼圖及自訂程式使用。",
  ],
  "render-pipelines.universal": [
    "art",
    "URP,渲染,跨平台",
    "使用通用渲染管線建立遊戲畫面，整理跨平台材質與渲染工作流程。",
  ],
  visualeffectgraph: [
    "effects",
    "粒子特效,VFX,GPU",
    "用節點編輯 GPU 模擬的視覺特效，製作粒子與動態畫面效果。",
  ],
};

const github = {
  "cysharp/unitask": [
    "tools",
    "非同步,async,效能優化",
    "為 Unity 提供 async/await 整合，組織非同步流程及取消操作。",
  ],
  "cysharp/r3": [
    "tools",
    "響應式,事件,程式架構",
    "以響應式資料流組織事件與狀態，作為 .NET 與 Unity 的程式架構工具。",
  ],
  "cysharp/messagepipe": [
    "tools",
    "事件,訊息,程式架構",
    "為 .NET 與 Unity 提供訊息傳遞管線，分離遊戲系統之間的溝通。",
  ],
  "cysharp/memorypack": [
    "tools",
    "資料儲存,序列化,存檔",
    "將 C# 物件序列化為二進位資料，供資料傳輸與儲存流程研究使用。",
  ],
  "hadashia/vcontainer": [
    "tools",
    "依賴注入,程式架構,DI",
    "在 Unity 中管理物件相依關係與生命週期，整理服務及遊戲系統。",
  ],
  "annulusgames/litmotion": [
    "animation",
    "補間,動畫系統,UI 介面",
    "以補間程式庫建立數值變化與動畫流程，處理遊戲及 UI 過場。",
  ],
  "kyrylokuzyk/primetween": [
    "animation",
    "補間,動畫系統,UI 介面",
    "透過程式建立補間動畫、延遲及序列，安排物件與介面的動態。",
  ],
  "mirrornetworking/mirror": [
    "systems",
    "多人連線,網路,同步",
    "以開源網路程式庫建立 Unity 多人遊戲，組織連線與狀態同步。",
  ],
  "firstgeargames/fishnet": [
    "systems",
    "多人連線,網路,同步",
    "提供 Unity 多人連線框架，建立網路物件及遊戲同步流程。",
  ],
  "inkle/ink": [
    "systems",
    "對話與任務,劇情,敘事",
    "以 Ink 敘事語言撰寫互動故事與分支劇情，銜接遊戲敘事流程。",
  ],
  "yarnspinnertool/yarnspinner-unity": [
    "systems",
    "對話與任務,劇情,對話",
    "將 Yarn Spinner 對話工具整合進 Unity，組織角色對話與互動故事。",
  ],
  "dbrizov/naughtyattributes": [
    "tools",
    "編輯器擴充,Inspector,效率",
    "以屬性標記擴充 Inspector 的欄位顯示，改善日常資料配置。",
  ],
  "modesttree/zenject": [
    "tools",
    "依賴注入,程式架構,DI",
    "透過依賴注入框架安排 Unity 物件建立、相依關係與系統組合。",
  ],
  "mob-sakai/uieffect": [
    "effects",
    "UI 介面,Shader,特效",
    "在 Inspector 或程式中組合 UI 濾鏡，建立灰階、模糊與溶解等效果。",
  ],
  "mob-sakai/softmaskforugui": [
    "effects",
    "UI 介面,遮罩,特效",
    "為 uGUI 加入柔邊遮罩，調整介面元素的裁切與過渡效果。",
  ],
  "yasirkula/unitynativefilepicker": [
    "tools",
    "Android,iOS,檔案",
    "透過行動平台原生檔案選取介面，處理文件匯入與匯出。",
  ],
  "yasirkula/unityingamedebugconsole": [
    "tools",
    "除錯,日誌,UI 介面",
    "在遊戲中顯示除錯訊息與執行命令，協助觀察執行階段行為。",
  ],
  "glitchenzo/nugetforunity": [
    "tools",
    "NuGet,相依管理,C#",
    "在 Unity 專案中管理 NuGet 套件，銜接 C# 程式庫。",
  ],
  "vrm-c/univrm": [
    "art",
    "VRM,角色,3D",
    "提供 Unity 的 VRM 格式實作，處理以 glTF 為基礎的角色模型。",
  ],
  "atteneder/gltfast": [
    "art",
    "glTF,3D,匯入匯出",
    "為 Unity 提供 glTF 模型匯入與匯出，銜接 3D 資產流程。",
  ],
  "unity-ui-extensions/com.unity.uiextensions": [
    "systems",
    "UI 介面,元件,工具",
    "補充 Unity UI 的控制項與元件，擴充常見介面製作功能。",
  ],
};

export const excluded = {
  "unity:com.unity.ads":
    "官方文件指出此套件的直接廣告變現整合已停止支援；新專案改研究 Ads Mediation。",
  "github:neuecc/unirx": "作者已封存倉庫；保留原始擷取結果，工具箱改收錄 R3。",
};

export function getCuration(item) {
  if (item.source === "asset-store") {
    const p = assetStoreCatalog.find(
      (p) => p.url.match(/-(\d+)$/)?.[1] === item.key,
    );
    if (p) return { category: p.category, tags: p.tags, summary: p.summary };
  }
  const row =
    item.source === "unity"
      ? unity[item.key.replace(/^com\.unity\./, "")]
      : github[item.key.toLowerCase()];
  return row
    ? { category: row[0], tags: row[1].split(","), summary: row[2] }
    : null;
}
