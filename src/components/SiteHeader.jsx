import { useState } from "react";
import {
  ArrowUpRight,
  Box,
  ChevronRight,
  LogOut,
  Megaphone,
  MessagesSquare,
  PenLine,
  Search,
  Sparkles,
} from "lucide-react";
import { navigate, routes, topicUrl, withQuery } from "../lib/router.js";

const navItems = [
  {
    href: routes.home,
    label: "論壇首頁",
    icon: MessagesSquare,
    match: ["home", "topics", "topic", "mine"],
  },
  { href: routes.packages, label: "套件探索", match: ["packages", "package"] },
  {
    href: routes.recommend,
    label: "智慧選包",
    icon: Sparkles,
    match: ["recommend"],
    badge: "NEW",
  },
  { href: routes.favorites, label: "我的收藏", match: ["favorites"] },
  { href: routes.guide, label: "新手指南", match: ["guide"] },
  { href: routes.resources, label: "開發指南下載", match: ["resources"] },
];

export function SiteHeader({ route, user, onLogin, onRegister, onSignOut, onCompose }) {
  const [search, setSearch] = useState(""),
    [searchScope, setSearchScope] = useState("topics");
  function submitSearch(e) {
    e.preventDefault();
    navigate(withQuery("/" + searchScope, { q: search.trim() }));
  }
  return (
    <>
      <div className="utility">
        <span>
          繁體中文<span className="divider">|</span>開發者的資源交流站
        </span>
        <div>
          {user ? (
            <>
              <span className="online-dot" />
              <strong>{user.username}</strong>
              <a href={routes.mine}>我的主題</a>
              <button onClick={onSignOut}>
                <LogOut size={12} /> 登出
              </button>
            </>
          ) : (
            <>
              <span className="muted desktop-only">歡迎來到 Unity 套件</span>
              <button onClick={onLogin}>登入</button>
              <span className="divider">|</span>
              <button className="utility-register" onClick={onRegister}>
                立即註冊
              </button>
            </>
          )}
        </div>
      </div>
      <header className="brand-header">
        <a className="brand" href="/" aria-label="Unity 套件首頁">
          <img src="/assets/mark.svg" alt="" />
          <div>
            <div className="wordmark">
              Unity <span>套件</span>
            </div>
            <div className="brand-subtitle">UNITY ASSETS COMMUNITY</div>
          </div>
        </a>
        <div className="header-message">
          <span>
            每一個好遊戲，<strong>從一個好點子開始。</strong>
          </span>
          <small>探索工具 · 分享經驗 · 讓創作更簡單</small>
        </div>
        <div className="header-cube" aria-hidden="true">
          <Box size={42} strokeWidth={1} />
        </div>
      </header>
      <nav className="main-nav" aria-label="主要導覽">
        <div>
          {navItems.map(({ href, label, icon: Icon, match, badge }) => (
            <a
              key={href}
              href={href}
              className={match.includes(route.name) ? "active" : ""}
              aria-current={match.includes(route.name) ? "page" : undefined}
            >
              {Icon && <Icon size={Icon === Sparkles ? 15 : 17} />}
              {label}
              {badge && <span className="new-label">{badge}</span>}
            </a>
          ))}
        </div>
        <button className="nav-compose" onClick={onCompose}>
          <PenLine size={15} />
          發表主題
        </button>
      </nav>
      <div className="search-row">
        <form onSubmit={submitSearch} role="search">
          <Search size={21} />
          <input
            aria-label="搜尋套件或主題"
            placeholder="搜尋套件、開發問題或靈感…"
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            aria-label="搜尋範圍"
            value={searchScope}
            onChange={(e) => setSearchScope(e.target.value)}
          >
            <option value="topics">主題</option>
            <option value="packages">套件</option>
          </select>
          <button className="search-button" type="submit">
            搜尋
          </button>
        </form>
        <div className="hot-search">
          <span>熱門搜尋：</span>
          {["DOTween", "角色", "RPG", "存檔"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setSearch(t);
                navigate(withQuery(routes.packages, { q: t }));
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="announcement">
        <a href={topicUrl(1)}>
          <Megaphone size={14} />
          <span>歡迎加入，一起把遊戲做出來！</span>
        </a>
        <a href={routes.guide}>
          新手上路：發文與套件選用指南 <ChevronRight size={13} />
        </a>
        <a href={routes.packages}>
          發現適合你的開發工具 <ArrowUpRight size={13} />
        </a>
      </div>
    </>
  );
}
