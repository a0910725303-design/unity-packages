import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Pin,
  X,
} from "lucide-react";
import { api } from "../lib/api.js";
import { navigate, topicUrl } from "../lib/router.js";
import { date, tagClass } from "../lib/format.js";
import { Empty, LoginPrompt } from "../components/Empty.jsx";

export function TopicList({
  query,
  mine,
  user,
  categories,
  categoryName,
  version,
  onCompose,
  onLogin,
}) {
  const [result, setResult] = useState(null),
    [error, setError] = useState(""),
    [sort, setSort] = useState("latest"),
    [page, setPage] = useState(1);
  const category = query.get("category") || "",
    q = query.get("q") || "";
  useEffect(() => {
    let active = true;
    setError("");
    setResult(null);
    const params = new URLSearchParams({
      sort,
      page,
      ...(category && { category }),
      ...(q && { q }),
      ...(mine && { mine: "true" }),
    });
    api("/topics?" + params)
      .then((r) => active && setResult(r))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, [category, q, sort, page, version, mine, user?.id]);
  if (mine && !user) return <LoginPrompt onLogin={onLogin} />;
  return (
    <section className="panel topics-panel">
      <div className="panel-title">
        <h2>
          <MessagesSquare size={18} />
          {mine
            ? "我的主題"
            : q
              ? "搜尋結果"
              : category
                ? categoryName(category)
                : "社群最新動態"}
          <span className="count-pill">{result?.total ?? "…"}</span>
        </h2>
        <button className="small-link" onClick={onCompose}>
          <PenLine size={14} />
          發表主題
        </button>
      </div>
      {q && (
        <div className="search-summary">
          搜尋「{q}」{" "}
          <a href="/topics">
            清除搜尋 <X size={12} />
          </a>
        </div>
      )}
      <div className="topic-controls">
        <div className="tabs">
          {[
            ["latest", "最新主題"],
            ["popular", "最多瀏覽"],
            ["replies", "最多回覆"],
          ].map(([s, t]) => (
            <button
              key={s}
              className={sort === s ? "selected" : ""}
              onClick={() => {
                setSort(s);
                setPage(1);
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          aria-label="選擇論壇版塊"
          value={category}
          onChange={(e) =>
            navigate(
              "/topics" + (e.target.value ? "?category=" + e.target.value : ""),
            )
          }
        >
          <option value="">所有版塊</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <Empty title="無法載入主題" description={error} />
      ) : !result ? (
        <div className="loading">正在載入主題…</div>
      ) : (
        <>
          {result.items.length ? (
            <>
              <div className="topic-table-header">
                <span>主題</span>
                <span>回覆 / 瀏覽</span>
                <span>作者 / 發表日期</span>
              </div>
              <div className="topic-rows">
                {result.items.map((t) => (
                  <article
                    key={t.id}
                    className={"topic-row " + (t.pinned ? "pinned" : "")}
                  >
                    <span
                      className={
                        "topic-symbol " + (t.pinned ? "pin-symbol" : "")
                      }
                    >
                      {t.pinned ? (
                        <Pin size={17} />
                      ) : (
                        <MessageCircle size={20} strokeWidth={1.3} />
                      )}
                    </span>
                    <div className="topic-main">
                      <div className="topic-line">
                        <span className={"type-badge " + tagClass(t.type)}>
                          {t.type}
                        </span>
                        <a
                          className={t.pinned ? "pinned-title" : ""}
                          href={topicUrl(t.id)}
                        >
                          {t.title}
                        </a>
                      </div>
                      <div className="topic-meta">
                        <a href={"/topics?category=" + t.category_id}>
                          {categoryName(t.category_id)}
                        </a>
                        {t.tags && (
                          <>
                            <span>·</span>
                            <span>
                              {t.tags.split(",").slice(0, 2).join(" / ")}
                            </span>
                          </>
                        )}
                        {Boolean(t.pinned) && (
                          <span className="pinned-label">版務置頂</span>
                        )}
                      </div>
                    </div>
                    <div className="topic-numbers">
                      <strong>{t.reply_count}</strong>
                      <span>{t.views}</span>
                    </div>
                    <div className="topic-author">
                      <span>{t.username}</span>
                      <small>{date(t.created_at)}</small>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <Empty
              title={mine ? "還沒有發表的主題" : "這裡還沒有符合的主題"}
              description="換個關鍵字試試，或成為第一位分享的人。"
            >
              <button className="secondary" onClick={onCompose}>
                發表主題
              </button>
            </Empty>
          )}
          <div className="pagination">
            <span>共 {result.total} 篇主題</span>
            <div>
              <button
                aria-label="上一頁"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft size={15} />
              </button>
              <span className="page-current">{page}</span>
              <span className="page-total">/ {result.pages}</span>
              <button
                aria-label="下一頁"
                disabled={page >= result.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
