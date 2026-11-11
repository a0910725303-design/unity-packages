import { ArrowRight, Box, MessageCircle, Users } from "lucide-react";
import { CategoryIndex } from "../components/CategoryIndex.jsx";
import { routes } from "../lib/router.js";

export function HomeBanner({ stats, categories }) {
  return (
    <>
      <section className="welcome-banner">
        <div>
          <span className="eyebrow">BUILT FOR CREATORS</span>
          <h1>好套件，讓好點子成真。</h1>
          <p>專屬 Unity 開發者的工具箱與交流空間。</p>
          <a href={routes.packages}>
            探索套件 <ArrowRight size={15} />
          </a>
        </div>
        <span className="banner-caption">BUILD YOUR NEXT WORLD</span>
      </section>
      <div className="community-stats">
        <span>
          <Box size={15} />
          套件索引 <strong>{stats.packages ?? "—"}</strong>
        </span>
        <span>
          <MessageCircle size={15} />
          交流主題 <strong>{stats.topics ?? "—"}</strong>
        </span>
        <span>
          <Users size={15} />
          社群會員 <strong>{stats.members ?? "—"}</strong>
        </span>
        <span className="stats-right">
          <span className="online-dot" /> 社群開放中，歡迎第一篇分享
        </span>
      </div>
      <CategoryIndex categories={categories} />
    </>
  );
}
