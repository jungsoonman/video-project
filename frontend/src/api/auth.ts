import {http} from "./http";


export type TokenResponse= {
    type : "Bearer";
    accessToken : string;
    expiresInMs : number;
}

const ACCESS_EXP_KEY = "access_exp_at";

let accessToken : string | null =null;
let accessExpAt =0;
let timer : number | null = null;


//새로고침 시 이전 expAt 복수 시도
(function initAccessExpAtFromStorage() {
    const raw = localStorage.getItem(ACCESS_EXP_KEY);
    if(!raw) return;

    const saved = Number(raw);

    if(!Number.isFinite(saved)) return;

    const remain = saved - Date.now();
    if (remain <= 0){
        localStorage.removeItem(ACCESS_EXP_KEY);
        return;
    }
    accessExpAt = saved;
    console.log("새로고침 : ");
    console.log("남은 시간 " + accessExpAt );
    scheduleRefresh(remain);
})();

// 탭 간 통신 채널
const bc = new BroadcastChannel("auth");

bc.onmessage = (ev) => {
  if (ev.data?.type === "access-updated") {
    // 다른 탭이 새 토큰 받으면 동기화
    console.log(ev);
    const { token, expiresIn } = ev.data.payload;
    setAccessLocal(token, expiresIn, /*broadcast*/ false);
  }
};
function setAccessLocal(token: string, expiresInMs: number, broadcast = true) {
  accessToken = token;
  accessExpAt = Date.now() + expiresInMs;
  
  //만료 시각만 localStorate에 저장
  localStorage.setItem(ACCESS_EXP_KEY , String(accessExpAt));

  scheduleRefresh(expiresInMs);
  if (broadcast) {
    bc.postMessage({ type: "access-updated", payload: { token, expiresIn: expiresInMs }});
  }
}

export function getAccessToken() {
    return accessToken;
}


function clearTimer() {
    if(timer){
        window.clearTimeout(timer);
        timer = null;
    }
}

function scheduleRefresh(expiresInMs: number){
    clearTimer();
    //만료 5초 전에 미리 

    const skew = 5000;
    console.log("expiresInMs : "+ expiresInMs)
    const delay = Math.max(0, expiresInMs  - skew);
    timer = window.setTimeout(doRefresh, delay);
}

async function doRefresh() {
    
    try{
        const r =await http.post<TokenResponse>("/auth/refresh", null ,{
            withCredentials: true, // HttpOnly refresh 쿠키 전송
        });
        //새 Access 올리고 타이머 재설정
        setAccessOnLogin(r.data.accessToken, r.data.expiresInMs);
    
    }catch{
        //실패면 로그인 화면 이동 등 처리
        accessToken = null;
        accessExpAt = 0;
        localStorage.removeItem(ACCESS_EXP_KEY);
    }
}

export async function bootstrapSession(){

    try {
        const r = await http.post<TokenResponse>("/auth/refresh",null,{
            withCredentials: true,
        });
        setAccessOnLogin(r.data.accessToken , r.data.expiresInMs);
    }catch{
        //로그인 필요 상태
        accessToken = null;
    }
}

export function setAccessOnLogin(token: string, expiresInMs: number) {
  setAccessLocal(token, expiresInMs);
}


export function clearAccess(){
    accessToken = null;
    accessExpAt = 0;
    localStorage.removeItem(ACCESS_EXP_KEY);
}


/*
* 로그인 API
* - email, password로 로그인
* - 서버는 응답 JSON으로 accessToken을 주고, refreshToken은 HttpOnly 쿠킬 심는다고 가정.
**/
export async function login(email:string, password:string) {
    
    const{data} = await http.post<TokenResponse>("/auth/login",{email, password});

    setAccessOnLogin(data.accessToken , data.expiresInMs);

    return data.accessToken; 
}

/**
 * 로그아웃 API(선택)
 * - 서버에서 refresh 쿠키 무효화 세션 삭제등
 */
 
export async function logout() {
    try{
        await http.post("/auth/logout");

    }finally{
        clearAccess();
    }
}

/** 남은 시간(ms) 반환, 없으면 0 */
export function getAccessRemainingMs(): number {
    
    const diff = accessExpAt - Date.now();
    return diff > 0? diff: 0;
}

 
 