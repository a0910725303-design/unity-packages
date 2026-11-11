import { useEffect, useState } from "react";
import { Check, CircleHelp } from "lucide-react";
import { api, write } from "./lib/api.js";
import { navigate, routes, topicUrl, useRoute } from "./lib/router.js";
import { usePageMeta } from "./lib/meta.js";
import { SiteHeader } from "./components/SiteHeader.jsx";
import { Breadcrumb } from "./components/Breadcrumb.jsx";
import { SiteFooter } from "./components/SiteFooter.jsx";
import { Sidebar } from "./components/Sidebar.jsx";
import { Modal } from "./components/Modal.jsx";
import { Auth } from "./components/Auth.jsx";
import { Compose } from "./components/Compose.jsx";
import { Empty } from "./components/Empty.jsx";
import { HomeBanner } from "./pages/HomePage.jsx";
import { TopicList } from "./pages/TopicList.jsx";
import { TopicDetail } from "./pages/TopicDetail.jsx";
import { PackageExplorer } from "./pages/PackageExplorer.jsx";
import { PackageDetail } from "./pages/PackageDetail.jsx";
import { ResourcesPage } from "./pages/ResourcesPage.jsx";
import { Recommend } from "./pages/Recommend.jsx";
import { Guide } from "./pages/Guide.jsx";

// 各頁面的分頁標題；主題與套件詳情頁由頁面元件依內容自行設定。
const pageTitles = {
  home: null,
  topics: "論壇主題",
  mine: "我的主題",
  packages: "套件探索",
  favorites: "我的收藏",
  recommend: "智慧選包",
  guide: "新手指南",
  resources: "免費開發指南下載",
  notFound: "找不到頁面",
};

function RouteMeta({ route, categoryName }) {
  const category = route.params.get("category");
  const q = route.params.get("q");
  let title = pageTitles[route.name];
  if (route.name === "topics" && category) title = categoryName(category);
  if (["topics", "packages"].includes(route.name) && q)
    title = `搜尋「${q}」`;
  usePageMeta(title);
  return null;
}

export function App() {
  const route = useRoute();
  const [user, setUser] = useState(null),
    [sessionReady, setSessionReady] = useState(false),
    [categories, setCategories] = useState([]),
    [packages, setPackages] = useState([]),
    [stats, setStats] = useState({}),
    [modal, setModal] = useState(null),
    [toast, setToast] = useState(""),
    [version, setVersion] = useState(0),
    [initialError, setInitialError] = useState("");
  const notify = (message) => setToast(message);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4000);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    api("/auth/session")
      .then((d) => {
        setUser(d.user);
        setSessionReady(true);
      })
      .catch((e) => setInitialError(e.message));
  }, []);
  useEffect(() => {
    if (!sessionReady) return;
    let active = true;
    Promise.all([api("/categories"), api("/packages"), api("/stats")])
      .then(([c, p, s]) => {
        if (active) {
          setCategories(c);
          setPackages(p);
          setStats(s);
          setInitialError("");
        }
      })
      .catch((e) => active && setInitialError(e.message));
    return () => {
      active = false;
    };
  }, [sessionReady, version, user?.id]);
  const refresh = () => setVersion((v) => v + 1);
  const categoryName = (id) =>
    categories.find((c) => c.id === id)?.name || "所有版塊";
  const requireLogin = (action) => {
    if (user) action();
    else setModal("login");
  };
  const savePackage = async (p) => {
    if (!user) {
      setModal("login");
      return;
    }
    try {
      await api("/favorites/" + p.id, write("PUT", { saved: !p.saved }));
      notify(p.saved ? "已取消收藏" : "已加入我的收藏");
      refresh();
    } catch (e) {
      notify(e.message);
    }
  };
  const signOut = async () => {
    try {
      await api("/auth/logout", write("POST", {}));
      await api("/auth/session");
      setUser(null);
      refresh();
      notify("已登出");
      if (["favorites", "mine"].includes(route.name)) navigate(routes.home);
    } catch (e) {
      notify(e.message);
    }
  };
  const common = {
    user,
    categories,
    packages,
    categoryName,
    version,
    onLogin: () => setModal("login"),
    onCompose: () => requireLogin(() => setModal("compose")),
    onSave: savePackage,
    onNotify: notify,
    onRefresh: refresh,
  };

  function renderPage() {
    switch (route.name) {
      case "home":
      case "topics":
      case "mine":
        return (
          <>
            {route.name === "home" && (
              <HomeBanner stats={stats} categories={categories} />
            )}
            <div className="content-layout">
              <TopicList
                key={route.key}
                {...common}
                query={route.params}
                mine={route.name === "mine"}
              />
              <Sidebar {...common} />
            </div>
          </>
        );
      case "topic":
        return (
          <div className="content-layout">
            <TopicDetail key={route.id} {...common} id={route.id} />
            <Sidebar {...common} />
          </div>
        );
      case "packages":
      case "favorites":
        return (
          <PackageExplorer
            {...common}
            query={route.params}
            savedOnly={route.name === "favorites"}
          />
        );
      case "package":
        return <PackageDetail key={route.id} {...common} id={route.id} />;
      case "resources":
        return <ResourcesPage {...common} />;
      case "recommend":
        return <Recommend {...common} />;
      case "guide":
        return <Guide onCompose={common.onCompose} />;
      default:
        return (
          <Empty title="找不到這個頁面" description="回到論壇首頁，繼續探索。">
            <a className="primary" href="/">
              返回首頁
            </a>
          </Empty>
        );
    }
  }

  return (
    <>
      {!["topic", "package"].includes(route.name) && (
        <RouteMeta route={route} categoryName={categoryName} />
      )}
      <div className="site-shell">
        <SiteHeader
          route={route}
          user={user}
          onLogin={() => setModal("login")}
          onRegister={() => setModal("register")}
          onSignOut={signOut}
          onCompose={common.onCompose}
        />
        <Breadcrumb route={route} categoryName={categoryName} />
        <main>
          {initialError ? (
            <div className="error-page">
              <CircleHelp />
              <h2>暫時無法連上社群</h2>
              <p>{initialError}</p>
              <button className="primary" onClick={() => location.reload()}>
                重新連線
              </button>
            </div>
          ) : !sessionReady ? (
            <div className="loading">正在開啟社群…</div>
          ) : (
            renderPage()
          )}
        </main>
        <SiteFooter />
      </div>
      {modal && (
        <Modal
          title={
            modal === "login"
              ? "歡迎回到 Unity 套件"
              : modal === "register"
                ? "加入 Unity 套件社群"
                : "發表新主題"
          }
          onClose={() => setModal(null)}
          wide={modal === "compose"}
        >
          {modal === "compose" ? (
            <Compose
              categories={categories}
              onSuccess={(id) => {
                setModal(null);
                refresh();
                navigate(topicUrl(id));
                notify("主題已發表");
              }}
            />
          ) : (
            <Auth
              mode={modal}
              onSwitch={setModal}
              onSuccess={(u) => {
                setUser(u);
                setModal(null);
                refresh();
                notify(
                  modal === "register" ? "註冊成功，歡迎加入！" : "登入成功",
                );
              }}
            />
          )}
        </Modal>
      )}
      {toast && (
        <div className="toast" role="status">
          <Check size={16} />
          {toast}
        </div>
      )}
    </>
  );
}
