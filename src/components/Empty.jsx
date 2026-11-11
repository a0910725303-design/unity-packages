import {
  Box,
  LogIn,
} from "lucide-react";

export function Empty({ title, description, children }) {
  return (
    <div className="empty">
      <Box size={34} strokeWidth={1.2} />
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function LoginPrompt({ onLogin }) {
  return (
    <section className="panel login-prompt">
      <Empty
        title="登入，打開你的專屬工具箱"
        description="收藏套件、發表主題，和開發者交流。"
      >
        <button className="primary" onClick={onLogin}>
          <LogIn size={16} />
          會員登入
        </button>
      </Empty>
    </section>
  );
}
