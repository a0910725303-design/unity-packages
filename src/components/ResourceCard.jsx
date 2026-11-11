import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Download,
} from "lucide-react";
import { packageUrl } from "../lib/router.js";

export function ResourceCard({ resource: r, user, onLogin }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (!user) {
      onLogin();
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(
        `/api/resources/${encodeURIComponent(r.id)}/download`,
        { credentials: "same-origin" },
      );
      if (response.status === 401) {
        onLogin();
        return;
      }
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "下載失敗，請稍後再試。");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = `${r.id}.md`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <article className="resource-card">
      <div className="resource-card-label">
        <BookOpen size={18} />
        <span>免費 Markdown</span>
        <small>會員下載</small>
      </div>
      <h3>{r.title}</h3>
      <p>{r.summary}</p>
      <ul>
        {r.contents.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {r.packages?.length > 0 && (
        <div className="resource-packages">
          <span>搭配套件</span>
          {r.packages.map((p) => (
            <a key={p.id} href={packageUrl(p.id)}>
              {p.name}
              <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      )}
      {error && (
        <p className="resource-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" onClick={download} disabled={busy}>
        <Download size={15} />
        {busy ? "準備下載…" : user ? "免費下載 .md" : "登入／註冊後免費下載"}
      </button>
    </article>
  );
}
