import { useState } from "react";
import {
  Send,
} from "lucide-react";
import { api, write } from "../lib/api.js";

export function Compose({ categories, onSuccess }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const d = await api(
        "/topics",
        write("POST", Object.fromEntries(new FormData(e.currentTarget))),
      );
      onSuccess(d.id);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <form className="compose-form" onSubmit={submit}>
      <p className="dialog-subtitle">
        分享工具、提出問題，或記錄你的開發旅程。
      </p>
      <div className="form-columns">
        <label>
          發文版塊
          <select name="category" required>
            <option value="">選擇版塊</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          主題類型
          <select name="type">
            {["討論", "心得", "教學", "發問", "分享"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        標題
        <input
          name="title"
          required
          minLength={4}
          maxLength={160}
          placeholder="用一句話，讓大家認識你的主題"
        />
      </label>
      <label>
        內容
        <textarea
          name="body"
          required
          minLength={10}
          maxLength={12000}
          rows={9}
          placeholder="可以寫下套件名稱、Unity 版本、使用情境與你的發現…"
        />
      </label>
      <label>
        標籤 <span className="muted">（選填，以逗號分隔）</span>
        <input name="tags" maxLength={200} placeholder="例如：RPG,角色,UI" />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="primary" disabled={busy}>
        <Send size={15} />
        {busy ? "發表中…" : "發表主題"}
      </button>
    </form>
  );
}
