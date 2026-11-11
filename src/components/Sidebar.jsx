import {
  ArrowRight,
  Bookmark,
  ChevronRight,
  PenLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { packageUrl } from "../lib/router.js";

export function Sidebar({ packages, onSave, user, onLogin, onCompose }) {
  return (
    <aside className="sidebar">
      <section className="side-welcome">
        <span className="side-eyebrow">HELLO, CREATOR.</span>
        <h3>
          {user ? `${user.username}，你好！` : "你的創作，不必獨自開始。"}
        </h3>
        <p>
          {user
            ? "今天有什麼新發現？和社群分享你的工具與靈感。"
            : "收藏實用工具，交流開發心得，找到下一個遊戲的靈感。"}
        </p>
        <button className="primary" onClick={user ? onCompose : onLogin}>
          {user ? <PenLine size={15} /> : <Users size={15} />}{" "}
          {user ? "分享我的發現" : "登入 / 加入社群"}
        </button>
        <small>免費加入，和開發者一起成長</small>
      </section>
      <section className="panel side-packages">
        <div className="panel-title">
          <h3>
            <Bookmark size={15} />
            編輯選包
          </h3>
          <a href="/packages" aria-label="查看全部套件">
            <ChevronRight size={15} />
          </a>
        </div>
        {packages.slice(0, 4).map((p) => (
          <div className="mini-package" key={p.id}>
            <a
              href={packageUrl(p.id)}
              className="package-monogram"
              style={{ "--package-color": p.color }}
            >
              {p.mark}
            </a>
            <div>
              <a href={packageUrl(p.id)}>
                {p.name}
              </a>
              <small>{p.publisher}</small>
            </div>
            <button
              className={"save-button " + (p.saved ? "saved" : "")}
              aria-label={(p.saved ? "取消收藏 " : "收藏 ") + p.name}
              onClick={() => onSave(p)}
            >
              <Bookmark size={16} fill={p.saved ? "currentColor" : "none"} />
            </button>
          </div>
        ))}
        <a className="side-more" href="/packages">
          探索所有套件 <ArrowRight size={13} />
        </a>
      </section>
      <a href="/recommend" className="creative-card">
        <img src="/assets/controller.webp" alt="原創積木風格遊戲控制器插畫" />
        <div>
          <span>從構想到工具箱</span>
          <strong>你的遊戲，需要什麼？</strong>
          <span className="creative-link">
            試試智慧選包 <ArrowRight size={14} />
          </span>
        </div>
      </a>
      <div className="side-note">
        <ShieldCheck size={18} />
        <p>
          套件連結導向官方來源。
          <br />
          版本、授權與價格以官方為準。
        </p>
      </div>
    </aside>
  );
}
