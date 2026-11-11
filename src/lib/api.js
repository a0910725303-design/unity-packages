let csrfToken = "";

export async function api(url, options = {}) {
  const response = await fetch("/api" + url, {
    credentials: "same-origin",
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
      ...options.headers,
    },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "連線失敗，請稍後再試。");
  if (data.csrfToken) csrfToken = data.csrfToken;
  return data;
}

export const write = (method, body) => ({ method, body: JSON.stringify(body) });
