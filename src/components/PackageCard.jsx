import {
  ArrowRight,
  Bookmark,
  Check,
  ExternalLink,
} from "lucide-react";
import { packageUrl } from "../lib/router.js";
import { fullDate } from "../lib/format.js";

export function PackageCard({ p, onSave, reason, isDetail = false }) {
  const sourceName =
    {
      unity: "Unity 官方",
      github: "作者 GitHub",
      "asset-store": "Asset Store",
      editorial: "編輯收錄",
    }[p.source_type] || "編輯收錄";
  const priceLabel =
    p.is_free === null
      ? "授權依官方"
      : p.is_free
        ? p.source_type === "github"
          ? "開源授權"
          : "免費套件"
        : "付費套件";
  return (
    <article className="package-card">
      <div className="package-card-top">
        <span
          className="package-monogram large"
          style={{ "--package-color": p.color }}
        >
          {p.mark}
        </span>
        <span className={"price-tag " + (p.is_free ? "free" : "")}>
          {priceLabel}
        </span>
        <button
          className={"save-button " + (p.saved ? "saved" : "")}
          aria-label={(p.saved ? "取消收藏 " : "收藏 ") + p.name}
          onClick={() => onSave(p)}
        >
          <Bookmark size={18} fill={p.saved ? "currentColor" : "none"} />
        </button>
      </div>
      <h3>
        {isDetail ? p.name : <a href={packageUrl(p.id)}>{p.name}</a>}
      </h3>
      <small className="publisher">{p.publisher}</small>
      <span className="package-source">{sourceName}</span>
      <p>{p.summary}</p>
      <div className="tags">
        {p.tags.slice(0, 3).map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {(p.source_version ||
        p.editor_version ||
        p.license ||
        p.source_updated_at) && (
        <details className="package-evidence">
          <summary>來源資訊</summary>
          <dl>
            {p.source_version && (
              <>
                <dt>來源版本</dt>
                <dd>{p.source_version}</dd>
              </>
            )}
            {p.editor_version && (
              <>
                <dt>文件對應</dt>
                <dd>Unity {p.editor_version}</dd>
              </>
            )}
            {p.license && (
              <>
                <dt>授權標示</dt>
                <dd>{p.license}</dd>
              </>
            )}
            {p.source_updated_at && (
              <>
                <dt>倉庫推送</dt>
                <dd>{fullDate(p.source_updated_at)}</dd>
              </>
            )}
          </dl>
        </details>
      )}
      {reason && (
        <div className="match-reason">
          <Check size={13} />
          {reason}
        </div>
      )}
      {!isDetail && (
        <a className="package-details-link" href={packageUrl(p.id)}>
          <span>
            {p.showcase_count
              ? `看實作案例（${p.showcase_count}）`
              : "查看套件介紹"}
          </span>
          <ArrowRight size={15} />
        </a>
      )}
      <a
        className="official-link"
        href={p.official_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {p.source_type === "unity"
          ? "查看官方套件文件"
          : p.source_type === "github"
            ? "查看作者 GitHub"
            : "前往 Unity Asset Store"}{" "}
        <ExternalLink size={14} />
      </a>
    </article>
  );
}
