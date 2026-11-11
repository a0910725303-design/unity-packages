import { useState } from "react";
import {
  ArrowRight,
} from "lucide-react";
import { api, write } from "../lib/api.js";

export function Auth({ mode, onSwitch, onSuccess }) {
  const register = mode === "register";
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const f = new FormData(e.currentTarget);
    if (register && f.get("password") !== f.get("confirm")) {
      setError("兩次輸入的密碼不一致。");
      return;
    }
    setBusy(true);
    try {
      const d = await api(
        "/auth/" + (register ? "register" : "login"),
        write(
          "POST",
          Object.fromEntries(
            [...f.entries()].map(([k, v]) => [k, k === "remember" ? true : v]),
          ),
        ),
      );
      onSuccess(d.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <p className="dialog-subtitle">
        {register
          ? "建立你的工具箱，加入每一場有意義的交流。"
          : "你的工具箱和開發夥伴，都在這裡。"}
      </p>
      <form className="auth-form" onSubmit={submit} key={mode}>
        {register ? (
          <>
            <label>
              會員帳號
              <input
                name="username"
                autoComplete="username"
                placeholder="2–24 個字，中文或英數字"
                required
                minLength={2}
                maxLength={24}
              />
            </label>
            <label>
              電子郵件
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                maxLength={254}
              />
            </label>
          </>
        ) : (
          <label>
            帳號或電子郵件
            <input
              name="identifier"
              autoComplete="username"
              placeholder="輸入你的帳號或電子郵件"
              required
              maxLength={254}
            />
          </label>
        )}
        <label>
          密碼
          <input
            name="password"
            type="password"
            autoComplete={register ? "new-password" : "current-password"}
            placeholder={register ? "至少 8 個字元" : "輸入密碼"}
            required
            minLength={register ? 8 : 1}
            maxLength={72}
          />
        </label>
        {register ? (
          <label>
            確認密碼
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              placeholder="再輸入一次密碼"
              required
              minLength={8}
              maxLength={72}
            />
          </label>
        ) : (
          <label className="check-label">
            <input type="checkbox" name="remember" />
            保持登入 30 天
          </label>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="primary" type="submit" disabled={busy}>
          {busy ? "處理中…" : register ? "建立帳號" : "登入"}
          <ArrowRight size={16} />
        </button>
      </form>
      <div className="auth-switch">
        {register ? "已經是社群成員？" : "還沒有帳號？"}
        <button
          onClick={() => {
            setError("");
            onSwitch(register ? "login" : "register");
          }}
        >
          {register ? "立即登入" : "免費註冊"}
        </button>
      </div>
    </>
  );
}
