import { ChevronRight, Home } from "lucide-react";

const labels = {
  resources: "開發指南下載",
  package: "套件介紹與實作案例",
  packages: "套件探索",
  recommend: "智慧選包",
  favorites: "我的收藏",
  guide: "新手指南",
  mine: "我的主題",
  topic: "主題內容",
  notFound: "找不到頁面",
};

export function Breadcrumb({ route, categoryName }) {
  const category = route.params.get("category");
  const label =
    labels[route.name] || (category ? categoryName(category) : "論壇首頁");
  return (
    <nav className="breadcrumb" aria-label="目前位置">
      <a href="/" aria-label="首頁">
        <Home size={14} />
      </a>
      <ChevronRight size={12} />
      <a href="/">Unity 套件</a>
      <ChevronRight size={12} />
      <span>{label}</span>
      <span className="breadcrumb-right">分享工具，也分享創作的可能。</span>
    </nav>
  );
}
