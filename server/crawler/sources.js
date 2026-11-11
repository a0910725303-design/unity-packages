import { assetStoreCatalog } from "./asset-catalog.js";

// Author-owned repositories, not search results or third-party mirrors.
// Adding a source only queues it for fetching; it does not imply endorsement.
export const githubSources = [
  "Cysharp/UniTask",
  "Cysharp/R3",
  "Cysharp/MessagePipe",
  "Cysharp/MemoryPack",
  "hadashiA/VContainer",
  "AnnulusGames/LitMotion",
  "KyryloKuzyk/PrimeTween",
  "MirrorNetworking/Mirror",
  "FirstGearGames/FishNet",
  "inkle/ink",
  "YarnSpinnerTool/YarnSpinner-Unity",
  "dbrizov/NaughtyAttributes",
  "neuecc/UniRx",
  "modesttree/Zenject",
  "mob-sakai/UIEffect",
  "mob-sakai/SoftMaskForUGUI",
  "yasirkula/UnityNativeFilePicker",
  "yasirkula/UnityIngameDebugConsole",
  "GlitchEnzo/NuGetForUnity",
  "vrm-c/UniVRM",
  "atteneder/glTFast",
  "Unity-UI-Extensions/com.unity.uiextensions",
];

export const assetStoreSources = assetStoreCatalog.map((p) => ({
  slug: p.slug,
  url: p.url,
}));
export const sourceTypes = ["unity", "github", "asset-store"];
export const allowedHosts = new Set([
  "docs.unity3d.com",
  "docs.unity.com",
  "assetstore.unity.com",
  "api.github.com",
]);

export function assertFetchUrl(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !allowedHosts.has(url.hostname)
  ) {
    throw new Error("來源網址不在允許的官方網域內");
  }
  return url;
}
