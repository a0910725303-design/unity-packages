import {
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { categoryIcons } from "../lib/format.js";

export function CategoryIndex({ categories }) {
  return (
    <section className="category-section">
      <div className="section-heading">
        <h2>
          <LayoutGrid size={17} />
          論壇版塊
        </h2>
        <span>找到你的開發同好</span>
        <a href="/topics">
          全部主題 <ChevronRight size={13} />
        </a>
      </div>
      <div className="category-grid">
        {categories.map((c) => {
          const Icon = categoryIcons[c.icon];
          return (
            <article className={"category-box " + c.color} key={c.id}>
              <a className="category-title" href={"/topics?category=" + c.id}>
                <span className="category-icon">
                  <Icon size={23} strokeWidth={1.6} />
                </span>
                <div>
                  <h3>{c.name}</h3>
                  <small>{c.count} 篇主題</small>
                </div>
                <ChevronRight className="cat-chevron" size={14} />
              </a>
              <p>{c.subtitle}</p>
              <div className="category-tags">
                {c.tags.map((t) => (
                  <a key={t} href={"/topics?q=" + encodeURIComponent(t)}>
                    {t}
                  </a>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
