import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { installLinkInterceptor, redirectLegacyHash } from "./lib/router.js";
import "./styles.css";

// 舊的 #/ 網址先轉成新網址，再啟動網站。
redirectLegacyHash();
installLinkInterceptor();

createRoot(document.getElementById("root")).render(<App />);
