import { useEffect, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ExternalLink,
  Gamepad2,
} from "lucide-react";
import { api } from "../lib/api.js";
import { usePageMeta } from "../lib/meta.js";
import { Empty } from "../components/Empty.jsx";
import { PackageCard } from "../components/PackageCard.jsx";
import { ResourceCard } from "../components/ResourceCard.jsx";

export function PackageDetail({ id, onSave, version, user, onLogin }) {
  const [p, setPackage] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!id) {
      setError("找不到這個套件。");
      return;
    }
    let active = true;
    api(`/packages/${encodeURIComponent(id || "")}`)
      .then((data) => {
        if (active) {
          setPackage(data);
          setError("");
        }
      })
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [id, version, user?.id]);
  usePageMeta(p ? p.name : error ? "找不到套件" : "套件介紹", p?.summary);
  if (error)
    return (
      <Empty title={error}>
        <a className="secondary" href="/packages">
          返回工具箱
        </a>
      </Empty>
    );
  if (!p) return <div className="loading">正在載入套件介紹…</div>;
  return (
    <section className="package-detail">
      <a className="back-to-toolbox" href="/packages">
        <ChevronLeft size={16} />
        返回開發工具箱
      </a>
      <div className="page-heading">
        <span className="eyebrow">FROM TOOLS TO GAMES</span>
        <h1>{p.name}</h1>
        <p>看看這個套件如何用在遊戲裡，再決定適不適合你的作品。</p>
      </div>
      <div className="package-detail-layout">
        <aside className="package-detail-info">
          <PackageCard p={p} onSave={onSave} isDetail />
        </aside>
        <div className="package-showcases">
          <div className="showcase-intro">
            <h2>
              <Gamepad2 size={21} />
              遊戲成品與實作案例
            </h2>
            <p>
              {p.game_count} 個遊戲成品 · {p.demo_count} 個官方示範
            </p>
            <span>
              每個案例都附使用來源與觀看重點，可前往作品頁、影片或試玩。
            </span>
          </div>
          {p.showcases.length ? (
            [
              {
                kind: "game",
                title: "遊戲成品",
                description:
                  "已有公開作品頁，並有作者或開發團隊的套件使用說明。",
              },
              {
                kind: "demo",
                title: "官方示範",
                description: "套件作者提供的操作展示、試玩或範例專案。",
              },
            ].map((group) => {
              const entries = p.showcases.filter((s) => s.kind === group.kind);
              return (
                entries.length > 0 && (
                  <section className="showcase-group" key={group.kind}>
                    <h3>
                      {group.title}
                      <span>{entries.length}</span>
                    </h3>
                    <p>{group.description}</p>
                    {entries.map((s) => (
                      <article className="showcase-card" key={s.id}>
                        <div className="showcase-card-heading">
                          <span className={`showcase-kind ${s.kind}`}>
                            {group.title}
                          </span>
                          <small>{s.creator}</small>
                        </div>
                        <h4>{s.title}</h4>
                        <p>{s.summary}</p>
                        <div className="showcase-highlights">
                          <strong>可以看什麼</strong>
                          <ul>
                            {s.highlights.map((h) => (
                              <li key={h}>{h}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="showcase-actions">
                          {s.links.map((link) => (
                            <a
                              className="secondary"
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {link.label}
                              <ExternalLink size={14} />
                            </a>
                          ))}
                        </div>
                        <div className="showcase-evidence">
                          <strong>套件使用依據</strong>
                          <p>{s.evidence.note}</p>
                          <a
                            href={s.evidence.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {s.evidence.label}
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </article>
                    ))}
                  </section>
                )
              );
            })
          ) : (
            <div className="panel showcase-empty">
              <BookOpen size={26} />
              <h3>這個套件還沒有收錄實作案例</h3>
              <p>
                目前尚未找到可確認使用關係的作品。你仍可從左側官方連結了解功能與範例。
              </p>
              <a className="secondary" href="/packages?cases=true">
                探索已有案例的套件
              </a>
            </div>
          )}
          {p.resources.length > 0 && (
            <section className="package-resources">
              <h2>
                <BookOpen size={20} />
                動手做：免費開發指南
              </h2>
              <p>將案例轉成自己的原型，取得製作規格、AI 實作提示與驗收清單。</p>
              <div className="resource-grid">
                {p.resources.map((r) => (
                  <ResourceCard
                    key={r.id}
                    resource={r}
                    user={user}
                    onLogin={onLogin}
                  />
                ))}
              </div>
              <a className="back-to-toolbox" href="/resources">
                查看所有開發指南
                <ArrowRight size={15} />
              </a>
            </section>
          )}
        </div>
      </div>
    </section>
  );
}
