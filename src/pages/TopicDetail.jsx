import { useCallback, useEffect, useState } from "react";
import {
  ChevronLeft,
  Eye,
  MessageCircle,
  MessagesSquare,
  Send,
} from "lucide-react";
import { api, write } from "../lib/api.js";
import { usePageMeta } from "../lib/meta.js";
import { fullDate, tagClass } from "../lib/format.js";
import { Empty } from "../components/Empty.jsx";
import { PackageCard } from "../components/PackageCard.jsx";

export function TopicDetail({
  id,
  user,
  onLogin,
  onNotify,
  onRefresh,
  onSave,
  categoryName,
  version,
  packages,
}) {
  const [topic, setTopic] = useState(null),
    [error, setError] = useState(""),
    [reply, setReply] = useState(""),
    [busy, setBusy] = useState(false);
  const load = useCallback(
    () =>
      api("/topics/" + id)
        .then(setTopic)
        .catch((e) => setError(e.message)),
    [id],
  );
  useEffect(() => {
    load();
  }, [load]);
  usePageMeta(
    topic ? topic.title : error ? "找不到主題" : "主題內容",
    topic?.body?.replace(/\s+/g, " ").slice(0, 150),
  );
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/topics/" + id + "/replies", write("POST", { body: reply }));
      setReply("");
      await load();
      onRefresh();
      onNotify("回覆已送出");
    } catch (e) {
      onNotify(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (error)
    return (
      <Empty title="無法開啟主題" description={error}>
        <a href="/" className="secondary">
          回到首頁
        </a>
      </Empty>
    );
  if (!topic) return <div className="loading">正在開啟主題…</div>;
  return (
    <div className="topic-detail">
      <section className="panel">
        <div className="detail-header">
          <a
            className="back-link"
            href={"/topics?category=" + topic.category_id}
          >
            <ChevronLeft size={14} />
            {categoryName(topic.category_id)}
          </a>
          <div className="detail-title">
            <span className={"type-badge " + tagClass(topic.type)}>
              {topic.type}
            </span>
            <h1>{topic.title}</h1>
          </div>
          <div className="detail-meta">
            <span>{fullDate(topic.created_at)}</span>
            <span>
              <Eye size={14} />
              {topic.views}
            </span>
            <span>
              <MessageCircle size={14} />
              {topic.replies.length} 則回覆
            </span>
          </div>
        </div>
        <div className="post-content">
          <div className="post-profile">
            <div className="avatar">{topic.username.slice(0, 1)}</div>
            <strong>{topic.username}</strong>
            <span>{topic.role === "editor" ? "站方編輯" : "社群會員"}</span>
            {topic.role === "editor" && <small>起始交流文章</small>}
          </div>
          <div className="post-body">
            <div className="prose">{topic.body}</div>
            {topic.tags && (
              <div className="tags">
                {topic.tags.split(",").map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            )}
            {topic.package && (
              <div className="related-package">
                <span>本文相關套件</span>
                <PackageCard
                  p={
                    packages.find((p) => p.id === topic.package.id) ||
                    topic.package
                  }
                  onSave={onSave}
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="panel replies">
        <div className="panel-title">
          <h2>
            <MessagesSquare size={17} />
            交流回覆 <span className="count-pill">{topic.replies.length}</span>
          </h2>
        </div>
        {topic.replies.length ? (
          topic.replies.map((r, i) => (
            <article className="reply" key={r.id}>
              <span className="avatar small">{r.username.slice(0, 1)}</span>
              <div>
                <div className="reply-meta">
                  <strong>{r.username}</strong>
                  <span>
                    {fullDate(r.created_at)} · #{i + 1}
                  </span>
                </div>
                <div className="prose">{r.body}</div>
              </div>
            </article>
          ))
        ) : (
          <p className="no-replies">還沒有回覆，來分享你的想法吧。</p>
        )}
        {user ? (
          <form className="reply-form" onSubmit={submit}>
            <label htmlFor="reply">發表回覆</label>
            <textarea
              id="reply"
              placeholder="分享你的經驗，讓討論更有幫助…"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              required
              minLength={2}
              maxLength={8000}
            />
            <button className="primary" disabled={busy}>
              <Send size={14} />
              {busy ? "送出中…" : "送出回覆"}
            </button>
          </form>
        ) : (
          <div className="reply-login">
            登入後加入討論，和大家交流想法。
            <button className="primary" onClick={onLogin}>
              登入回覆
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
