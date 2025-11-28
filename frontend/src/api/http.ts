/**
 * 공통 axios 인스턴스
 * -baseURL : 모든 API의 공통 prefix (ex: http://localhost:8080/api)
 * -withCredentials: refresh-token이 쿠키에 실릴 경우를 대비해 true 설정
 * -응답 인터셉터: 401(만료) 시 /auth/refresh 호출 -> 기존 요청 재시도
 */
import axios from "axios"; //axios: 프론트엔드에서 백엔드 API 서버와 통신할 때 사용하는 HTTP 클라이언트 라이브러리 
                            //axios.get("/api/videos") -> 영상 목록 가져오기. or axios.post("/api/videos/upload", formData)


export const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // .env 설정값 사용
    withCredentials: true //서버가 SameSite/ HttpOnly 쿠키로 refresh 를 줄때 필요
});

// 동시에 401이 여러번 발생할 때 refresh 를 1번만 보내기 위한 guard
let refreshing: Promise<void> | null =null;
http.interceptors.response.use(
    (response) => response, // 성공 응답은 그대로 통과
    async (error) => {
        const {config, response} =error;

        //응답이 있고, 401(Unauthorized) 이며, 아직 재시도하지 않은 요청이면
        if(response?.status === 401 && !config._retry){
            config._retry = true; // 무한 루프 방지 플래그

            //이미 regresh 시도가 진행 중이면 그 Promise를 재사용
            refreshing ??= http
            .post("/auth/refresh")  //서버의 토큰 재발급 엔드포인트(쿠키 기반 가정)
            .then(()=>{
                //성공시 아무것도 안함(서버가 쿠키 재설정)
            })
            .finally(()=> {
                //완료되면 다음 401을 대비해 초기화
                refreshing = null;
            });
            //refresh 완료까지 대기
            await refreshing;
            
            //원래 실패했던 요청을 재시도
            return http(config);
        }
        //그 외 에러는 상위로 전파
        return Promise.reject(error);
    }
    
)
