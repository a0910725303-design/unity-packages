import { useEffect, useState } from "react";

// 網址對照：
//   /                 論壇首頁
//   /topics           主題列表（?category=、?q=）
//   /topics/:id       主題內容
//   /mine             我的主題
//   /packages         套件探索（?q=、?cases=true）
//   /packages/:id     套件介紹與案例
//   /favorites        我的收藏
//   /recommend        智慧選包
//   /guide            新手指南
//   /resources        開發指南下載
export const routes = {
  home: "/",
  topics: "/topics",
  mine: "/mine",
  packages: "/packages",
  favorites: "/favorites",
  recommend: "/recommend",
  guide: "/guide",
  resources: "/resources",
};
export const topicUrl = (id) => `/topics/${encodeURIComponent(id)}`;
export const packageUrl = (id) => `/packages/${encodeURIComponent(id)}`;
export const withQuery = (path, params) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== "" && v != null),
  ).toString();
  return qs ? `${path}?${qs}` : path;
};

const EVENT = "app:navigate";

// 舊版網址是 #/topic?id=1、#/package?id=153，自動換成新網址，讓舊連結仍可使用。
export function redirectLegacyHash() {
  if (!location.hash.startsWith("#/")) return;
  const [path, query = ""] = location.hash.slice(1).split("?");
  const params = new URLSearchParams(query);
  let target = path || "/";
  const id = params.get("id");
  if (path === "/topic" && id) {
    target = topicUrl(id);
    params.delete("id");
  } else if (path === "/package" && id) {
    target = packageUrl(id);
    params.delete("id");
  }
  const qs = params.toString();
  history.replaceState(null, "", target + (qs ? "?" + qs : ""));
}

function matchRoute(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) return { name: "home", path };
  if (segments.length === 1) {
    const name = Object.keys(routes).find((k) => routes[k] === path);
    return { name: name || "notFound", path };
  }
  if (segments.length === 2 && /^\d+$/.test(segments[1])) {
    if (segments[0] === "topics")
      return { name: "topic", path, id: segments[1] };
    if (segments[0] === "packages")
      return { name: "package", path, id: segments[1] };
  }
  return { name: "notFound", path };
}

function read() {
  return {
    ...matchRoute(location.pathname),
    params: new URLSearchParams(location.search),
    key: location.pathname + location.search,
  };
}

export function navigate(to, { replace = false } = {}) {
  const url = new URL(to, location.href);
  const next = url.pathname + url.search + url.hash;
  if (next === location.pathname + location.search + location.hash) {
    window.scrollTo({ top: 0, behavior: "instant" });
    return;
  }
  history[replace ? "replaceState" : "pushState"](null, "", next);
  window.dispatchEvent(new Event(EVENT));
}

// 攔截站內 <a href="/..."> 點擊，改用前端切換頁面，不重新載入整頁。
export function installLinkInterceptor() {
  document.addEventListener("click", (e) => {
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey
    )
      return;
    const a = e.target.closest?.("a[href]");
    if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download"))
      return;
    const url = new URL(a.href, location.href);
    if (
      url.origin !== location.origin ||
      url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/assets/") ||
      /\.[a-z0-9]+$/i.test(url.pathname)
    )
      return;
    e.preventDefault();
    navigate(url.pathname + url.search + url.hash);
  });
}

export function useRoute() {
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const listener = () => {
      setRoute(read());
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", listener);
    window.addEventListener(EVENT, listener);
    return () => {
      window.removeEventListener("popstate", listener);
      window.removeEventListener(EVENT, listener);
    };
  }, []);
  return route;
}
