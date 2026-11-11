import { useEffect } from "react";

export const SITE_NAME = "Unity 套件";
const DEFAULT_TITLE = "Unity 套件｜開發者的資源交流站";
const DEFAULT_DESCRIPTION =
  "Unity 套件開發者社群，探索套件、交流實作心得，找到適合下一個遊戲的工具。";

function setMeta(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el) el.setAttribute(attr, value);
}

// 依頁面更新瀏覽器分頁標題、描述與分享卡片資訊。
export function usePageMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title}｜${SITE_NAME}` : DEFAULT_TITLE;
    const desc = (description || DEFAULT_DESCRIPTION).slice(0, 160);
    document.title = fullTitle;
    setMeta('meta[name="description"]', "content", desc);
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", desc);
    setMeta('meta[property="og:url"]', "content", location.href.split("#")[0]);
    setMeta('link[rel="canonical"]', "href", location.origin + location.pathname);
  }, [title, description]);
}
