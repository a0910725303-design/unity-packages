import {
  Bookmark,
  Box,
  Heart,
  MessagesSquare,
  PenLine,
} from "lucide-react";

export function Guide({ onCompose }) {
  return (
    <section className="guide-page">
      <div className="page-heading">
        <span className="eyebrow">START HERE</span>
        <h1>歡迎來到你的開發者基地。</h1>
        <p>一起分享有用的工具，讓創作路上少一點摸索。</p>
      </div>
      <div className="guide-grid">
        {[
          [
            Box,
            "01",
            "找到合適的套件",
            "從「套件探索」依名稱與用途搜尋，再前往官方頁面確認版本、授權及平台支援。先做獨立測試專案，再導入正式專案。",
          ],
          [
            Bookmark,
            "02",
            "建立自己的工具箱",
            "註冊或登入後，按下套件旁的書籤，就能把想研究的工具保存到「我的收藏」。",
          ],
          [
            MessagesSquare,
            "03",
            "分享你的開發經驗",
            "發文時說明 Unity 版本、渲染管線、平台與重現步驟。分享心得時，分清楚親自測試的結果與待確認的推測。",
          ],
          [
            Heart,
            "04",
            "讓社群更有幫助",
            "友善回覆、尊重作者。分享官方連結與自己的經驗，讓其他開發者更容易找到有用的資訊。",
          ],
        ].map(([Icon, num, title, body]) => (
          <article className="panel guide-card" key={num}>
            <div>
              <Icon size={26} />
              <span>{num}</span>
            </div>
            <h2>{title}</h2>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <div className="guide-cta">
        <div>
          <h2>準備好分享你的第一個發現了嗎？</h2>
          <p>一個小技巧，也可能成為另一位開發者的大幫助。</p>
        </div>
        <button className="primary" onClick={onCompose}>
          <PenLine size={15} />
          發表第一篇主題
        </button>
      </div>
    </section>
  );
}
