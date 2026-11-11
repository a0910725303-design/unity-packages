import robotsParser from "robots-parser";
import { setTimeout as delay } from "node:timers/promises";
import { assertFetchUrl } from "./sources.js";

export const userAgent = "UnityToolboxCatalog/1.0";
const retryable = new Set([429, 500, 502, 503, 504]);

export class CrawlError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

// Sequential requests, including redirects and robots.txt, are throttled per host.
export function createHttpClient({
  fetchImpl = fetch,
  sleep = delay,
  intervalMs = 1000,
  timeoutMs = 20000,
} = {}) {
  const lastRequest = new Map(),
    robots = new Map();
  async function request(value, { allow404 = false, checkRobots = true } = {}) {
    let url = assertFetchUrl(value);
    for (let redirects = 0; redirects <= 4; redirects++) {
      if (checkRobots && url.hostname !== "api.github.com") {
        if (!robots.has(url.origin)) {
          const policy = await request(`${url.origin}/robots.txt`, {
            allow404: true,
            checkRobots: false,
          });
          robots.set(
            url.origin,
            robotsParser(`${url.origin}/robots.txt`, policy?.body || ""),
          );
        }
        if (robots.get(url.origin).isAllowed(url.href, userAgent) === false) {
          throw new CrawlError(
            "來源 robots.txt 不允許擷取此頁",
            "ROBOTS_DENIED",
          );
        }
      }
      let response;
      for (let attempt = 0; attempt < 3; attempt++) {
        const crawlDelay = robots.get(url.origin)?.getCrawlDelay(userAgent);
        const pause = Math.max(intervalMs, Number(crawlDelay || 0) * 1000);
        await sleep(
          Math.max(
            0,
            (lastRequest.get(url.hostname) || 0) + pause - Date.now(),
          ),
        );
        lastRequest.set(url.hostname, Date.now());
        try {
          response = await fetchImpl(url.href, {
            redirect: "manual",
            signal: AbortSignal.timeout(timeoutMs),
            headers: {
              "User-Agent": userAgent,
              Accept: "application/json, text/html, text/plain",
            },
          });
        } catch {
          if (attempt === 2)
            throw new CrawlError("網路連線失敗或逾時", "NETWORK_ERROR");
          await sleep(1000 * 2 ** attempt);
          continue;
        }
        if (!retryable.has(response.status) || attempt === 2) break;
        const header = response.headers.get("retry-after");
        const retryAfter = /^\d+$/.test(header || "")
          ? Number(header) * 1000
          : Date.parse(header) - Date.now();
        await response.body?.cancel();
        // Don't retry before a long server cooldown; leave it to a later run.
        if (retryAfter > 30000)
          throw new CrawlError("來源要求稍後重試", "RATE_LIMITED");
        await sleep(Math.max(1000 * 2 ** attempt, retryAfter || 0));
      }
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location)
          throw new CrawlError("來源重新導向缺少網址", "INVALID_REDIRECT");
        url = assertFetchUrl(new URL(location, url).href);
        continue;
      }
      if (response.status === 404 && allow404) {
        await response.body?.cancel();
        return null;
      }
      if (!response.ok) {
        await response.body?.cancel();
        throw new CrawlError(
          `來源回應 HTTP ${response.status}`,
          `HTTP_${response.status}`,
        );
      }
      const reader = response.body.getReader(),
        chunks = [];
      let length = 0;
      try {
        while (true) {
          const part = await reader.read();
          if (part.done) break;
          length += part.value.byteLength;
          if (length > 8 * 1024 * 1024) {
            await reader.cancel();
            throw new CrawlError("來源資料超過 8 MB 上限", "BODY_TOO_LARGE");
          }
          chunks.push(Buffer.from(part.value));
        }
      } catch (error) {
        if (error instanceof CrawlError) throw error;
        throw new CrawlError("來源內容讀取中斷", "BODY_READ_ERROR");
      } finally {
        reader.releaseLock();
      }
      return { body: Buffer.concat(chunks).toString("utf8"), url: url.href };
    }
    throw new CrawlError("來源重新導向次數過多", "TOO_MANY_REDIRECTS");
  }
  return { request };
}
