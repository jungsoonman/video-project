import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { searchUser } from "../../api/user";
import { UserData } from "../../user/UserContext";
import { http } from "../../api/http";
import { getAccessRemainingMs } from "../../api/auth";


export default function UserState() {
  const nav = useNavigate();
  const loc = useLocation();
  const { accessToken, signOut } = useAuth();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingImg, setLoadingImg] = useState(false);

  const [remainMs, setRemainMs] = useState<number>(0);

  // 1) 유저 정보 조회
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sEmail = localStorage.getItem("email");
        if (!sEmail) {
          if (alive) setLoadingUser(false);
          return;
        }
        const data = await searchUser(sEmail);
        if (alive) setUserData(data);
      } catch (e) {
        console.log(e);
      } finally {
        if (alive) setLoadingUser(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() =>{
    if(!accessToken) {
      setRemainMs(0);
      return;
    }

    const update = () => setRemainMs(getAccessRemainingMs());
    update(); // 최초 한번

    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  },[accessToken]);

  function formatRemain(ms: number): string {
    if (!ms || ms <= 0) return "00:00";
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // 2) 프로필 이미지 presigned URL
  useEffect(() => {
    let alive = true;

    if (!userData?.profileKey) {
      setImageUrl("/img/basic.png");
      return;
    }

    (async () => {
      try {
        setLoadingImg(true);
        const pres = await http.get<{ url: string }>(
          `/files/urlGet/${encodeURIComponent(userData.profileKey)}/presigned`
        );
        if (alive) setImageUrl(pres.data.url);
      } catch (e) {
        console.error(e);
        if (alive) setImageUrl("/img/basic.png");
      } finally {
        if (alive) setLoadingImg(false);
      }
    })();

    return () => { alive = false; };
  }, [userData?.profileKey]);

  const onImgError = () => setImageUrl("/img/basic.png");

  return (
    <div id="userstate" role="userstate">
      {accessToken ? (
        <div className="user-status">
          <div className={`avatar ${loadingImg ? "skeleton" : ""}`}>
            <img
              src={imageUrl ?? "/img/basic.png"}
              alt={userData?.name ?? "profile"}
              onError={onImgError}
            />
          </div>

          <div className="user-block">
            <div
              className={`user-name ${loadingUser ? "skeleton" : ""}`}
              title={userData?.name || ""}
            >
              {userData?.name ?? "—"}
            </div>
            <div className="token-timer" aria-label="access token remaining time">
              <span className="label">로그인 만료시간</span>
              <span className="time">{formatRemain(remainMs)}</span>
            </div>
          </div>

          <div className="split" aria-hidden />

          <button className="btn_upload" onClick={() => nav("/upload")} title="업로드">
            업로드
          </button>
          <button className="btn_signout" onClick={() => signOut()} title="로그아웃">
            로그아웃
          </button>
        </div>
      ) : (
        <div className="login-box">
          <img src="/img/basic.png" alt="profile" className="profile-img" />
          <button className="login-btn" onClick={() => nav("/login")}>로그인</button>
          <button className="signup-btn" onClick={() => nav("/signup")}>회원가입</button>
        </div>
      )}
    </div>
  );
}
