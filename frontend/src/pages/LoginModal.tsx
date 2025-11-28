import React, { FormEvent,useState } from "react";
import { GoKey } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { MdOutlineAlternateEmail } from "react-icons/md";
import { TbPassword } from "react-icons/tb";
import { login } from "../api/auth";




export default function LoginModal(){

    const nav = useNavigate();
    const loc = useLocation();
    const {loginWithToken} = useAuth();

    const[email, setEmail] = useState("");
    const[pw , setPw] = useState("");
    const[showPw , setShowPw] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const[pending, setPending] = useState(false);

    const onSubmit = async(e:FormEvent) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        try{
            const accessToken = await login(email, pw);
            console.log("accessToken : " + accessToken);
            loginWithToken(accessToken, email);
            nav("/");
        }catch(err:any){
            setError(err?.response?.data?.message || "로그인에 실패했습니다.");
            alert("이메일 혹은 비밀번호가 틀렸습니다.");
        }finally{
            setPending(false);
        }
    };


    return (
        <div className="login-page">
            <div className="login_box">
            {/* 로고/브랜드 라인 */}
            <div className="brand">
                <span className="logo-bars" aria-hidden="true">
                <span />
                <span />
                <span />
                </span>
                <h1>J-tube</h1>
            </div>

            <div className="panel">
                <h2 className="title">
                <GoKey />
                Login
                </h2>

                <form onSubmit={onSubmit}>
                <div className="login_info">
                    <div className="div_email_box field">
                    <MdOutlineAlternateEmail />
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    </div>

                    <div className="div_pw_box field">
                    <TbPassword />
                    <input
                        type={showPw ? "text" : "password"}
                        value={pw}
                        onChange={e => setPw(e.target.value)}
                        placeholder="Password"
                    />
                    </div>

                    <div className="pw-extra">
                    <label>
                        <input
                        type="checkbox"
                        className="checkbox"
                        onChange={() => setShowPw(s => !s)}
                        />
                        숨김해제
                    </label>
                    <label>
                        <input type="checkbox" className="checkbox" />
                        Remember me
                    </label>
                    </div>
                </div>

                <div className="actions">
                    <div className="links">
                    <button type="button" className="link">Lost your password?</button>
                    <button type="button" className="link" onClick={() => nav("/signup")}>Sign Up</button>
                    </div>
                    <button type="submit" className="btn btn-primary">Login</button>
                </div>
                </form>

                <div className="div_login_bottom">
                계정이 없나요?{" "}
                <button className="btn_underline" onClick={() => nav("/signup")}>
                    회원가입
                </button>
                </div>
            </div>
            </div>
        </div>
        );
}