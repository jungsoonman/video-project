/**
 * 앱 전역에서 고르인 여부/유저 정보/토큰을 쉽게 사용.
 * 액세스 토큰을 메모리 또는 localStorage에 저장 가능
 */
import { createContext,useContext,useEffect,useMemo,useState } from "react";
import{logout as apiLogout} from "../api/auth";
import{http} from "../api/http";

type AuthState = {
    accessToken: string | null;
    email: string | null;       //필요시 더 많은 프로필 추가 
};

type AuthContextValue = AuthState & {
    loginWithToken: (token: string, email?:string ,id?:string) => void;
    signOut: ()=> Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null > (null);

export function AuthProvider({children}: {children:
    React.ReactNode }){
        const [accessToken, setAccessToken] = useState<string | null>(() => 
            localStorage.getItem("accessToken"));
        const [email, setEmail] = useState<string |null>(() =>
        localStorage.getItem("email"));

        // 액세스 토큰이 바뀔때 마다 axios 기본 Authorization 헤더 갱신
        useEffect(() =>{
            if(accessToken){
                http.defaults.headers.common["Authorization"] = `Bearer${accessToken}`;
                localStorage.setItem("accessToken",accessToken);
            }else{
                delete http.defaults.headers.common["Authorization"];
                localStorage.removeItem("accessToken");
            }
        },[accessToken]);

        //이메일(또는 유저명) 저장 삭제
        useEffect(() => {
            if(email) localStorage.setItem("email",email);
            else localStorage.removeItem("email");
        },[email]);

        const loginWithToken = (token: string , userEmail?: string) =>{
            setAccessToken(token);
            if(userEmail) setEmail(userEmail);
        };

        const signOut = async ()=>{
            try{
                await apiLogout();
            }finally{
                setAccessToken(null);
                setEmail(null);
            }
        };

        const value = useMemo<AuthContextValue>(() =>({
            accessToken, email, loginWithToken, signOut
        }),[accessToken,email]);

        return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
    }
    export function useAuth() {
        const ctx = useContext(AuthContext);
        if(!ctx) throw new Error("useAuth must be used within AuthProvider");
        return ctx;
    }

