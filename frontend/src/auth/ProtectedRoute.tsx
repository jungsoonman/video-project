import {Navigate, useLocation} from "react-router-dom";
import { useAuth } from "./AuthContext";
import { JSX } from "react";

/**
 * 보호 라우트: 로그인 안 됐으면 /login 으로 보냄
 * - 예) 업로드 페이지, 마이 페이지 등 
 */
export default function ProtectedRoute({children}: {children: JSX.Element}){
    const { accessToken } = useAuth();
    const loc = useLocation();

    if(!accessToken){
        // 로그인 후 돌아올 수 있도록 redirect 경로 포함.
        return <Navigate to={`/login?redirect=${encodeURIComponent(loc.pathname + loc.search)}`} replace />
    }
    return children;
}