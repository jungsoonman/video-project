// auth-multi.ts
import axios from "axios";

type TokenResponse = { type: "Bearer"; token: string; expiresIn: number };

let accessToken: string | null = null;
let accessExpAt = 0;
let timer: number | null = null;

// 탭 간 통신 채널
const bc = new BroadcastChannel("auth");

bc.onmessage = (ev) => {
  if (ev.data?.type === "access-updated") {
    // 다른 탭이 새 토큰 받으면 동기화
    const { token, expiresIn } = ev.data.payload;
    setAccessLocal(token, expiresIn, /*broadcast*/ false);
  }
};

function setAccessLocal(token: string, expiresInMs: number, broadcast = true) {
  accessToken = token;
  accessExpAt = Date.now() + expiresInMs;
  scheduleRefresh(expiresInMs);
  if (broadcast) {
    bc.postMessage({ type: "access-updated", payload: { token, expiresIn: expiresInMs }});
  }
}

export function getAccessToken() {
  return accessToken;
}

export async function bootstrapSession() {
  try {
    const r = await axios.post<TokenResponse>("/api/auth/refresh", null, { withCredentials: true });
    setAccessLocal(r.data.token, r.data.expiresIn);
  } catch {
    accessToken = null;
  }
}

export function setAccessOnLogin(token: string, expiresInMs: number) {
  setAccessLocal(token, expiresInMs);
}

function clearTimer() {
  if (timer) {
    window.clearTimeout(timer);
    timer = null;
  }
}

// 간단 리더 선출: localStorage 락
const LOCK_KEY = "auth_refresh_lock";
const LOCK_TTL_MS = 15_000;

function tryAcquireLock(): boolean {
  const now = Date.now();
  const raw = localStorage.getItem(LOCK_KEY);
  const until = raw ? parseInt(raw, 10) : 0;
  if (until > now) return false; // 누가 보유 중
  // lock 획득
  localStorage.setItem(LOCK_KEY, String(now + LOCK_TTL_MS));
  return true;
}
function renewLock() {
  localStorage.setItem(LOCK_KEY, String(Date.now() + LOCK_TTL_MS));
}
function releaseLock() {
  localStorage.removeItem(LOCK_KEY);
}

function scheduleRefresh(expiresInMs: number) {
  clearTimer();
  const skew = 5000;
  const delay = Math.max(0, expiresInMs - skew);

  timer = window.setTimeout(async () => {
    // 리더만 refresh 수행
    if (!tryAcquireLock()) return; // 다른 탭이 수행

    try {
      // 긴 작업 중 잠깐씩 갱신
      renewLock();
      const r = await axios.post<TokenResponse>("/api/auth/refresh", null, { withCredentials: true });
      // 내 탭에 반영 + 브로드캐스트
      setAccessLocal(r.data.token, r.data.expiresIn);
    } catch {
      accessToken = null;
    } finally {
      releaseLock();
    }
  }, delay);
}
