import { useEffect, useState } from "react";
import {
  BookOpen,
} from "lucide-react";
import { api } from "../lib/api.js";
import { Empty } from "../components/Empty.jsx";
import { ResourceCard } from "../components/ResourceCard.jsx";

export function ResourcesPage({ user, onLogin }) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api("/resources")
      .then((r) => active && setItems(r))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [attempt]);
  return (
    <section className="resources-page">
      <div className="page-heading">
        <span className="eyebrow">BUILD YOUR OWN GAME</span>
        <h1>免費開發指南</h1>
        <p>把看過的案例變成自己的遊戲原型，從一份能照著做的規格開始。</p>
      </div>
      <div className="resource-intro">
        <BookOpen size={24} />
        <div>
          <strong>註冊登入後，免費下載 Markdown 原始檔</strong>
          <p>
            內含原創遊戲規格、套件分工、分階段實作提示與驗收清單，可交給 AI
            程式助手，也能手動照著做。所需套件與素材請另行準備。
          </p>
        </div>
      </div>
      {error ? (
        <Empty title={error}>
          <button
            className="secondary"
            onClick={() => setAttempt((n) => n + 1)}
          >
            重新載入
          </button>
        </Empty>
      ) : !items ? (
        <div className="loading">正在載入開發指南…</div>
      ) : (
        <div className="resource-grid">
          {items.map((r) => (
            <ResourceCard
              key={r.id}
              resource={r}
              user={user}
              onLogin={onLogin}
            />
          ))}
        </div>
      )}
    </section>
  );
}
