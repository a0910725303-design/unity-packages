import { ArrowUp, Box } from "lucide-react";
import { routes } from "../lib/router.js";

export function SiteFooter() {
  return (
    <footer>
      <div>
        <a className="footer-brand" href="/">
          <Box size={18} />
          Unity 套件
        </a>
        <p>連結創意與工具，讓每個遊戲想法都有起點。</p>
      </div>
      <div>
        <a href={routes.guide}>社群指南</a>
        <a href={routes.packages}>官方資源索引</a>
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          回到頂部 <ArrowUp size={12} />
        </button>
        <p>
          © {new Date().getFullYear()} Unity 套件社群 · 獨立社群，非 Unity
          官方網站
        </p>
      </div>
    </footer>
  );
}
