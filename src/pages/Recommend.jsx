import { useState } from "react";
import {
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { api, write } from "../lib/api.js";
import { PackageCard } from "../components/PackageCard.jsx";

export function Recommend({ packages, onSave }) {
  const features = [
    "UI 介面",
    "角色控制",
    "布料物理",
    "動畫系統",
    "資料儲存",
    "AI 與尋路",
    "對話與任務",
    "遊戲回饋",
    "編輯器擴充",
  ];
  const [description, setDescription] = useState(""),
    [selected, setSelected] = useState([]),
    [freeOnly, setFreeOnly] = useState(false),
    [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      setResult(
        await api(
          "/recommend",
          write("POST", { description, features: selected, freeOnly }),
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="recommend-page">
      <div className="page-heading">
        <span className="eyebrow">A LITTLE DIRECTION. A BIG START.</span>
        <h1>
          <Sparkles size={27} />
          讓你的點子，找到合適工具。
        </h1>
        <p>描述你想做的遊戲，從本站套件索引組合一份研究清單。</p>
      </div>
      <div className="recommend-layout">
        <form className="panel recommend-form" onSubmit={submit}>
          <label htmlFor="game-idea">
            01 <strong>你想製作什麼遊戲？</strong>
          </label>
          <textarea
            id="game-idea"
            value={description}
            maxLength={1000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="例如：我想做一款 3D RPG，需要 NPC 尋路、角色對話和存檔功能。"
          />
          <label>
            02 <strong>選擇需要的功能</strong>
          </label>
          <div className="feature-options">
            {features.map((f) => (
              <label key={f} className={selected.includes(f) ? "checked" : ""}>
                <input
                  type="checkbox"
                  checked={selected.includes(f)}
                  onChange={() =>
                    setSelected((s) =>
                      s.includes(f) ? s.filter((x) => x !== f) : [...s, f],
                    )
                  }
                />
                {f}
              </label>
            ))}
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
            />
            只推薦免費套件
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary" disabled={busy}>
            <Sparkles size={16} />
            {busy ? "配對中…" : "產生套件建議"}
          </button>
          <p className="fine-print">
            目前依用途標籤配對，未串接生成式
            AI；建議不代表套件已通過相容性實測。
          </p>
        </form>
        <div className="recommend-aside">
          <img src="/assets/controller.webp" alt="原創遊戲控制器與積木插畫" />
          <h3>先做出最小可玩的版本。</h3>
          <p>
            不必一次準備所有工具。先釐清核心玩法，再把真正需要的套件加入工具箱。
          </p>
          <a href="/guide">
            看看選包指南 <ArrowRight size={14} />
          </a>
        </div>
      </div>
      {result && (
        <section className="recommend-results" aria-live="polite">
          <div className="section-heading">
            <h2>你的套件研究清單</h2>
            <span>{result.items.length} 個配對</span>
          </div>
          <p>{result.note}</p>
          <div className="package-grid">
            {result.items.map((p) => (
              <PackageCard
                key={p.id}
                p={packages.find((x) => x.id === p.id) || p}
                onSave={onSave}
                reason={p.reason}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
