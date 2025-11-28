import React, { FormEvent, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";

type SignupUser = {
  email: string;
  name: string;
  passwordHash: string;
};

export default function SignUpModal() {
  const nav = useNavigate();

  // step: 1 기본정보 → 2 프로필 이미지
  const [step, setStep] = useState<1 | 2>(1);

  const [email, setEmail] = useState("");
  const [name, setName] = useState<string>("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ----- 슬라이드 높이 보정 -----
  const containerRef = useRef<HTMLDivElement | null>(null);
  const step1Ref = useRef<HTMLDivElement | null>(null);
  const step2Ref = useRef<HTMLDivElement | null>(null);

  const fitHeight = () => {
    const c = containerRef.current;
    const active = step === 1 ? step1Ref.current : step2Ref.current;
    if (!c || !active) return;
    c.style.height = active.offsetHeight + "px";
  };

  useLayoutEffect(() => {
    requestAnimationFrame(fitHeight);
    const onResize = () => fitHeight();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 이미지 선택
  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImage(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // 다음(1→2)
  const onNext = () => {
    if (!name.trim()) return setError("성함을 입력하세요.");
    if (!email.trim()) return setError("이메일을 입력하세요.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("올바른 이메일 형식이 아닙니다.");
    if (pw.length < 6) return setError("비밀번호는 6자 이상이어야 합니다.");
    if (pw !== confirm) return setError("비밀번호가 일치하지 않습니다.");
    setError(null);
    setStep(2);
    requestAnimationFrame(fitHeight);
  };

  // 저장(회원가입)
  const fn_signUp = async (e: FormEvent) => {
    e.preventDefault();
    if (step !== 2) return;
    if (!profileImage) {
      setError("프로필 이미지를 선택해 주세요.");
      return;
    }

    setPending(true);
    setError(null);
    try {
      const user: SignupUser = { email, name, passwordHash: pw };
      const fd = new FormData();
      fd.append("user", new Blob([JSON.stringify(user)], { type: "application/json" }));
      fd.append("file", profileImage, profileImage.name);

      await http.post("/users", fd);
      nav("/login", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={fn_signUp}>
      <div className="signup_page">
        <div className="signup_box">
          <div className="brand-row">
            <span className="logo-bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <h1>J-tube</h1>
          </div>

          <h2>계정 만들기</h2>

          {/* 슬라이드 컨테이너 */}
          <div className="wizard" ref={containerRef}>
            <div
              className="wizard-track"
              style={{ transform: step === 1 ? "translateX(0)" : "translateX(-50%)" }}
            >
              {/* STEP 1: 기본정보 */}
              <div className="wizard-pane" ref={step1Ref}>
                <div className="userinfo_box">
                  <div className="username_box field">
                    <input
                      type="text"
                      placeholder="성함"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="userId_box field">
                    <input
                      type="email"
                      placeholder="이메일"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="userPw_box field">
                    <input
                      type="password"
                      placeholder="비밀번호"
                      value={pw}
                      onChange={(e) => setPw(e.target.value)}
                      required
                    />
                  </div>
                  <div className="userPwCofm_box field">
                    <input
                      type="password"
                      placeholder="비밀번호 재확인"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="btn_box">
                  <button type="button" className="btn btn-primary" onClick={onNext}>
                    다음
                  </button>
                </div>
              </div>

              {/* STEP 2: 프로필 이미지 */}
              <div className="wizard-pane" ref={step2Ref}>
                <div className="profile-picker">
                  <div className="avatar">
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" />
                    ) : (
                      <div className="placeholder">이미지를 선택하세요</div>
                    )}
                  </div>

                  <label className="pick-btn">
                    이미지 선택
                    <input type="file" accept="image/*" hidden onChange={onPickFile} />
                  </label>
                </div>

                {error && <p className="error-text">{error}</p>}

                <div className="btn_box between">
                  <button type="button" className="btn" onClick={() => { setStep(1); fitHeight(); }}>
                    이전
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={pending}>
                    {pending ? "저장 중…" : "저장"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="foot">
            <span>이미 계정이 있으신가요?</span>
            <button type="button" className="link" onClick={() => nav("/login")}>
              로그인
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
