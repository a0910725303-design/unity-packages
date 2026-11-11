import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Empty, LoginPrompt } from "../components/Empty.jsx";
import { PackageCard } from "../components/PackageCard.jsx";

export function PackageExplorer({
  packages,
  user,
  onLogin,
  onSave,
  query,
  savedOnly,
  categories,
}) {
  const [category, setCategory] = useState(""),
    [freeOnly, setFreeOnly] = useState(false),
    [source, setSource] = useState(""),
    [withCases, setWithCases] = useState(query.get("cases") === "true"),
    [page, setPage] = useState(1),
    [search, setSearch] = useState(query.get("q") || "");
  useEffect(() => {
    setSearch(query.get("q") || "");
    setCategory("");
    setSource("");
    setWithCases(query.get("cases") === "true");
  }, [query.get("q"), query.get("cases"), savedOnly]);
  useEffect(
    () => setPage(1),
    [category, freeOnly, search, source, savedOnly, withCases],
  );
  if (savedOnly && !user) return <LoginPrompt onLogin={onLogin} />;
  const filtered = packages.filter(
    (p) =>
      (!savedOnly || p.saved) &&
      (!category || p.category_id === category) &&
      (!source || p.source_type === source) &&
      (!freeOnly || p.is_free) &&
      (!withCases || p.showcase_count > 0) &&
      (!search ||
        [p.name, p.publisher, p.source_key, p.summary, ...p.tags]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 24));
  const currentPage = Math.min(page, pageCount);
  return (
    <section className="explorer">
      <div className="page-heading">
        <span className="eyebrow">
          {savedOnly ? "YOUR TOOLBOX" : "DISCOVER YOUR NEXT TOOL"}
        </span>
        <h1>{savedOnly ? "我的收藏" : "探索你的開發工具箱"}</h1>
        <p>
          {savedOnly
            ? "把實用工具留在身邊，下次靈感來時就找得到。"
            : "從熟悉的開發需求出發，找到值得深入研究的 Unity 套件。"}
        </p>
      </div>
      {!savedOnly && (
        <div className="catalog-overview" aria-label="工具箱收錄來源">
          <span>
            <strong>{packages.length}</strong> 個開發工具
          </span>
          <span>
            Unity 官方{" "}
            <b>{packages.filter((p) => p.source_type === "unity").length}</b>
          </span>
          <span>
            作者 GitHub{" "}
            <b>{packages.filter((p) => p.source_type === "github").length}</b>
          </span>
          <span>
            Asset Store{" "}
            <b>
              {
                packages.filter((p) =>
                  ["asset-store", "editorial"].includes(p.source_type),
                ).length
              }
            </b>
          </span>
          <a className="catalog-cases" href="/packages?cases=true">
            <Gamepad2 size={15} />
            有實作案例{" "}
            <b>{packages.filter((p) => p.showcase_count > 0).length}</b>
          </a>
        </div>
      )}
      <div className="explorer-controls">
        <div className="inline-search">
          <Search size={17} />
          <input
            aria-label="篩選套件"
            placeholder="輸入名稱或功能關鍵字"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button aria-label="清除套件搜尋" onClick={() => setSearch("")}>
              <X size={15} />
            </button>
          )}
        </div>
        <select
          aria-label="套件分類"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">所有分類</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="套件來源"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        >
          <option value="">所有來源</option>
          <option value="unity">Unity 官方</option>
          <option value="github">作者 GitHub</option>
          <option value="asset-store">Asset Store</option>
          {packages.some((p) => p.source_type === "editorial") && (
            <option value="editorial">編輯收錄</option>
          )}
        </select>
        <label className="check-label">
          <input
            type="checkbox"
            checked={freeOnly}
            onChange={(e) => setFreeOnly(e.target.checked)}
          />
          只看免費
        </label>
        <label className="check-label">
          <input
            type="checkbox"
            checked={withCases}
            onChange={(e) => setWithCases(e.target.checked)}
          />
          只看有案例
        </label>
        <span className="result-count">{filtered.length} 個套件</span>
      </div>
      {filtered.length ? (
        <div className="package-grid">
          {filtered.slice((currentPage - 1) * 24, currentPage * 24).map((p) => (
            <PackageCard p={p} key={p.id} onSave={onSave} />
          ))}
        </div>
      ) : (
        <Empty
          title={savedOnly ? "還沒有符合條件的收藏" : "沒有符合的套件"}
          description={
            savedOnly
              ? "在套件卡片上按下書籤，即可加入收藏。"
              : "調整分類或搜尋詞，再試一次。"
          }
        >
          {savedOnly ? (
            <a className="secondary" href="/packages">
              探索所有套件
            </a>
          ) : (
            <button
              className="secondary"
              onClick={() => {
                setSearch("");
                setCategory("");
                setSource("");
                setFreeOnly(false);
                setWithCases(false);
              }}
            >
              清除篩選
            </button>
          )}
        </Empty>
      )}
      {pageCount > 1 && (
        <nav className="toolbox-pagination" aria-label="套件分頁">
          <button
            className="secondary"
            disabled={currentPage === 1}
            onClick={() => setPage(currentPage - 1)}
          >
            <ChevronLeft size={16} />
            上一頁
          </button>
          <span aria-live="polite">
            第 {currentPage} / {pageCount} 頁 · {filtered.length} 個套件
          </span>
          <button
            className="secondary"
            disabled={currentPage === pageCount}
            onClick={() => setPage(currentPage + 1)}
          >
            下一頁
            <ChevronRight size={16} />
          </button>
        </nav>
      )}
      <p className="catalog-note">
        <ShieldCheck size={14} />
        依官方公開資料建立索引，再整理繁體中文用途。收錄不代表實測推薦；版本相容性、服務費用與授權請查看來源。免費篩選只顯示已確認免費或開源授權的項目。
      </p>
    </section>
  );
}
