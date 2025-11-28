import React, { useEffect, useMemo, useRef, useState } from "react";
import Main from "../components/section/Main";
import { useLocation, useNavigate } from "react-router-dom";
import { http } from "../api/http";

type Privacy = "public" | "unlisted" | "private";
const CATEGORIES = [
  "애니메이션",
  "영화",
  "취미",
  "게임",
  "음악",
  "스포츠",
  "강의",
  "뉴스",
] as const;

/** 드래그/클릭/키보드 지원 카테고리 바 — 독립 컴포넌트 */
function CategoryBar({
  items,
  valueIndex,
  onChange,
}: {
  items: readonly string[];
  valueIndex: number;
  onChange: (i: number) => void;
}) {
  const segRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLDivElement | null>(null);

  const moveTo = (i: number, instant = false) => {
    const track = trackRef.current;
    const handle = handleRef.current;
    if (!track || !handle) return;

    const nodes = Array.from(track.children) as HTMLDivElement[];
    const target = nodes[i];
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const parent = track.getBoundingClientRect();
    const padding = 6;
    const left = rect.left - parent.left + padding;

    nodes.forEach((el, idx) => el.classList.toggle("active", idx === i));
    handle.style.width = `${rect.width}px`;
    handle.style.left = `${left}px`;
    handle.style.transition = instant ? "none" : "left .18s ease, width .18s ease";
  };

  // 항목 렌더 및 초기 위치
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    track.innerHTML = "";
    items.forEach((c, i) => {
      const el = document.createElement("div");
      el.className = "seg-item";
      el.textContent = c;
      el.addEventListener("click", () => onChange(i));
      track.appendChild(el);
    });

    requestAnimationFrame(() => moveTo(valueIndex, true));

    // 키보드 이동
    const seg = segRef.current!;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onChange(Math.min(items.length - 1, valueIndex + 1));
      if (e.key === "ArrowLeft")  onChange(Math.max(0, valueIndex - 1));
    };
    seg.addEventListener("keydown", onKey);

    const onResize = () => moveTo(valueIndex, true);
    window.addEventListener("resize", onResize);

    return () => {
      seg.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // 값 바뀌면 슬라이더 이동
  useEffect(() => { moveTo(valueIndex); }, [valueIndex]);

  // 드래그 이동
  useEffect(() => {
    const seg = segRef.current!;
    const handle = handleRef.current!;
    let dragging = false, startX = 0, startLeft = 0;

    const down = (e: MouseEvent) => {
      dragging = true; startX = e.clientX; startLeft = handle.offsetLeft; e.preventDefault();
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      const nodes = Array.from(trackRef.current!.children) as HTMLDivElement[];
      const centers = nodes.map(el => el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2);
      const hc = handle.getBoundingClientRect().left + handle.getBoundingClientRect().width / 2;
      let nearest = 0, dist = Infinity;
      centers.forEach((c, i) => { const d = Math.abs(c - hc); if (d < dist) { dist = d; nearest = i; } });
      onChange(nearest);
    };
    const move = (e: MouseEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const min = 6;
      const max = (seg.clientWidth - handle.offsetWidth - 6);
      const next = Math.max(min, Math.min(max, startLeft + dx));
      handle.style.left = `${next}px`;
    };

    seg.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => {
      seg.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
  }, []);

  return (
    <div className="seg" ref={segRef} tabIndex={0} aria-label="콘텐츠 종류 선택">
      <div className="seg-handle" ref={handleRef} />
      <div className="seg-track" ref={trackRef} />
    </div>
  );
}

export default function VideoUploadPage() {

  //type
  type videoInfoType ={
    title: string;
    description: string;
    tags: string;        // ← 서버로 보낼 때 문자열
    contentType: string;
    userId: number;
  }

  // file & form
  const nav = useNavigate();
  const loc = useLocation();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // --- Tags: pill 입력용 상태 ---
  const [tagsArr, setTagsArr] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [privacy, setPrivacy] = useState<Privacy>("public");
  const [progress, setProgress] = useState(0);
  const [videoInfo, setVideoInfo] = useState<videoInfoType | null >(null);

  // category (기본값: 게임)
  const [categoryIndex, setCategoryIndex] = useState(3);
  const category = useMemo(() => CATEGORIES[categoryIndex], [categoryIndex]);

  // 비디오/썸네일
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // helpers
  const bytes = (size: number) => {
    const u = ["B", "KB", "MB", "GB"]; let i = 0;
    while (size > 1024 && i < u.length - 1) { size /= 1024; i++; }
    return `${size.toFixed(1)} ${u[i]}`;
  };

  // ========= Tags: handlers =========
  const sanitize = (s: string) => s.trim().replace(/\s+/g, " ");

  const addTags = (raw: string | string[]) => {
    const parts = Array.isArray(raw) ? raw : raw.split(",");
    let next = [...tagsArr];
    for (let p of parts) {
      const v = sanitize(p);
      if (!v) continue;
      if (v.length > 30) continue;
      if (next.includes(v)) continue;
      next.push(v);
    }
    if (next.length > 20) next = next.slice(0, 20);
    setTagsArr(next);
  };

  const removeTag = (i: number) => {
    const next = [...tagsArr];
    next.splice(i, 1);
    setTagsArr(next);
  };

  const onTagInputChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const v = e.target.value;
    if (v.includes(",")) {
      addTags(v);
      setTagInput("");
    } else {
      setTagInput(v);
    }
  };

  const onTagKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) {
        addTags(tagInput);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && !tagInput) {
      if (tagsArr.length) removeTag(tagsArr.length - 1);
    }
  };

  const onTagBlur: React.FocusEventHandler<HTMLInputElement> = () => {
    if (tagInput.trim()) {
      addTags(tagInput);
      setTagInput("");
    }
  };
  // =================================

  // file handlers
  const onDrop: React.DragEventHandler<HTMLLabelElement> = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  };

  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
  };

  function loadFile(f: File) {
    setFile(f);
    setProgress(0);
    const url = URL.createObjectURL(f);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return url; });

    // 새 파일 선택 시 기존 썸네일 정리
    setThumbFile(prev => {
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
      return null;
    });
    setThumbUrl(null);
  }

  useEffect(() => {
    // cleanup preview/thumbnail url
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    };
  }, [previewUrl, thumbUrl]);

  // 썸네일: 현재 프레임 캡처
  const captureThumbnail = async () => {
    const video = videoElRef.current;
    if (!video) return alert("영상을 먼저 선택해 주세요.");
    if (video.readyState < 2) {
      await new Promise<void>((resolve) => {
        const onLoaded = () => {
          video.removeEventListener("loadeddata", onLoaded);
          resolve();
        };
        video.addEventListener("loadeddata", onLoaded);
      });
    }

    const w = 640;
    const ratio = (video.videoWidth || 16) / (video.videoHeight || 9);
    const h = Math.round(w / ratio);

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, w, h);

    const blob: Blob = await new Promise((res) =>
      canvas.toBlob((b) => res(b!), "image/jpeg", 0.85)!
    );
    const nameBase = file?.name?.replace(/\.[^/.]+$/, "") || "thumbnail";
    const f = new File([blob], `${nameBase}.jpg`, { type: "image/jpeg" });

    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    setThumbFile(f);
    setThumbUrl(URL.createObjectURL(f));
  };

  // 썸네일: 로컬 이미지 업로드
  const onChangeThumb: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/^image\/(png|jpe?g|webp)$/i.test(f.type)) {
      e.currentTarget.value = "";
      return alert("PNG, JPG, WEBP 이미지만 업로드할 수 있어요.");
    }
    if (thumbUrl) URL.revokeObjectURL(thumbUrl);
    setThumbFile(f);
    setThumbUrl(URL.createObjectURL(f));
  };

  // upload (demo)
  const onUpload = async () => {
    if (!file) { alert("먼저 영상을 선택해 주세요."); return; }
    if (!title) { alert("제목을 입력해주세요."); return; }
    setProgress(0);
    const id = setInterval(() => {
      setProgress(p => {
        const next = Math.min(100, p + Math.random() * 14 + 4);
        if (next >= 100) clearInterval(id);
        return next;
      });
    }, 220);
    console.log("category :: " + category);

    //데이터 형성..
    const meta : videoInfoType =
      videoInfo ?? {
        title: title,
        description: desc,
        tags: tagsArr.join(","),   // ← pill 배열을 "롤드컵,롤챔스"로 직렬화
        contentType: category,
        userId : 0,
      };

    try{
      const formData = new FormData();

      //1. 파일넣기
      formData.append("file" , file);
      console.log("파일성공 : " + file);

      //2. JSON 메타데이터 문자열로 변환해서 넣기
      formData.append(
        "meta", new Blob([JSON.stringify(meta)],{type:"application/json"})
      );
      console.log("meta: " +JSON.stringify(meta));

      //3. 썸네일(선택)
      if (thumbFile) {
        formData.append("thumbnail", thumbFile);
      }

      //4. 요청보내기
      console.log("token : " + localStorage.getItem("accessToken"));
      const response = await http.post("/videos/upload", formData, {
        headers:{
          Authorization: "Bearer " + localStorage.getItem("accessToken"),
        },
      });

      nav("/");

    } catch(e){
      console.log(e);
    } finally {
      // no-op
    }
  };

  const onReset = () => {
    if (fileRef.current) fileRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
    setFile(null);
    setPreviewUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setThumbUrl(prev => { if (prev) URL.revokeObjectURL(prev); return null; });
    setThumbFile(null);
    setTitle(""); setDesc("");
    setTagInput(""); setTagsArr([]);            // ← 태그 초기화
    setPrivacy("public"); setProgress(0);
  };

  return (
    <Main title="유튜브 채널" description="유튜브 채널 페이지입니다.">
      <form onSubmit={(e) => { e.preventDefault(); onUpload(); }} className="fm_upload">
        <div className="vu container">
          <header className="vu-head">
            <div className="brand">
              <span className="logo-bars" aria-hidden="true">
                <span /><span /><span />
              </span>
              <h1>영상 업로드</h1>
            </div>
            <div className="actions">
              <button className="btn secondary" type="button">임시 저장</button>
              <button className="btn" type="button" onClick={onUpload}>업로드</button>
            </div>
          </header>

          <main className="vu-grid">
            {/* LEFT */}
            <section className="card">
              <h2>파일 선택</h2>
              <label
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
              >
                <input ref={fileRef} type="file" accept="video/*" onChange={onChangeFile} hidden />
                <div className="dz-title">여기로 영상을 드래그하거나</div>
                <div className="dz-sub">MP4, MOV 등 주요 포맷 지원 • 최대 2GB (예시)</div>
                <div className="dz-cta">컴퓨터에서 선택</div>
              </label>

              {/* Preview & form */}
              {previewUrl && (
                <div className="preview">
                  <video ref={videoElRef} src={previewUrl} controls />

                  {/* 카테고리 드래그바 */}
                  <div className="seg-wrap">
                    <CategoryBar
                      items={CATEGORIES}
                      valueIndex={categoryIndex}
                      onChange={setCategoryIndex}
                    />
                    <div className="seg-caption">
                      콘텐츠 종류: <b>{category}</b>
                    </div>
                  </div>

                  {/* 썸네일 지정 */}
                  <div className="thumb-wrap">
                    <div className="thumb-head">
                      <h3>썸네일</h3>
                      <div className="thumb-actions">
                        <button className="btn secondary" type="button" onClick={captureThumbnail}>
                          현재 프레임 캡처
                        </button>
                        <button
                          className="btn secondary"
                          type="button"
                          onClick={() => thumbInputRef.current?.click()}
                        >
                          이미지 업로드
                        </button>
                        <input
                          ref={thumbInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          hidden
                          onChange={onChangeThumb}
                        />
                      </div>
                    </div>

                    <div className="thumb-body">
                      {thumbUrl ? (
                        <img className="thumb-preview" src={thumbUrl} alt="선택된 썸네일 미리보기" />
                      ) : (
                        <div className="thumb-placeholder">썸네일이 아직 없습니다.</div>
                      )}
                    </div>
                  </div>

                  <div className="meta-row">
                    <div className="field">
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                      />
                    </div>
                    <div className="field">
                      <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value as Privacy)}
                      >
                        <option value="public">공개</option>
                        <option value="unlisted">일부공개</option>
                        <option value="private">비공개</option>
                      </select>
                    </div>
                  </div>

                  {/* 태그 입력 + pill */}
                  <div className="field tags-field">
                    <input
                      value={tagInput}
                      onChange={onTagInputChange}
                      onKeyDown={onTagKeyDown}
                      onBlur={onTagBlur}
                      placeholder="태그 입력 후 쉼표(,) 또는 Enter ▶ 예: 롤드컵, 롤챔스"
                    />
                     
                  </div>
                 {tagsArr.length > 0 && (
                    <div className="tags-pills">
                      {tagsArr.map((t, i) => (
                        <span key={t + i} className="tag-pill" aria-label={`태그 ${t}`}>
                          {t}
                          <button
                            type="button"
                            className="tag-pill-x"
                            aria-label={`${t} 제거`}
                            onClick={() => removeTag(i)}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}

                  <textarea
                    className="textarea"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="설명 (선택)"
                  />

                  <div className="progress" style={{ display: progress > 0 ? "block" : "none" }}>
                    <div className="bar-wrap"><div className="bar" style={{ width: `${progress}%` }} /></div>
                    <div className="help">{Math.floor(progress)}%</div>
                  </div>

                  <div className="footer-actions">
                    <button className="btn secondary" type="button" onClick={onReset}>초기화</button>
                    <button className="btn" type="button" onClick={onUpload}>업로드</button>
                    <button className="btn danger" type="button" onClick={onReset}>삭제</button>
                  </div>
                </div>
              )}
            </section>

            {/* RIGHT */}
            <aside className="card">
              <h2>업로드 정보</h2>
              <div className="kv">
                <div>파일명</div><div>{file?.name ?? "-"}</div>
                <div>용량</div><div>{file ? bytes(file.size) : "-"}</div>
                <div>콘텐츠</div><div>{previewUrl ? CATEGORIES[categoryIndex] : "-"}</div>
                <div>상태</div><div>{progress >= 100 ? "완료" : file ? "미리보기 준비" : "대기"}</div>
                <div>썸네일</div><div>{thumbUrl ? "지정됨" : "-"}</div>
                <div>태그</div><div>{tagsArr.length ? tagsArr.join(",") : "-"}</div>
              </div>
            </aside>
          </main>
        </div>
      </form>
    </Main>
  );
}
