import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchvideo } from "../api/video";
import type { VideoDetail } from "../types/video";
import Main from "../components/section/Main";
import { http } from "../api/http";

async function fetchVideoById(id: string): Promise<VideoDetail> {
    
    try{
        const r = await fetchvideo(id);
        return r;
    }catch{
        throw new Error("영상 정보를 불러오지 못했습니다.");
    }
  
  
}


const fmtViews = (n: number) =>
  new Intl.NumberFormat("ko-KR", { notation: "compact" }).format(n);


export default function WatchPage() {
  const { videoID } = useParams<{videoID:string}>();
  const [video, setVideo] = useState<VideoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [descOpen, setDescOpen] = useState(false);
  const didSend = React.useRef(false);

  useEffect(() => {
    console.log("id : " + videoID);
    (async () => {
      try {
        if (!videoID) return; 
        const v = await fetchVideoById(videoID);
        setVideo(v);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [videoID]);
  useEffect(()=>{
    if (didSend.current || !videoID) return;
    didSend.current=true;
    console.log("view ++");
    (async ()=>{
        try{
            const result = await http.post(`/videos/${videoID}/view`);
            console.log("view : " +  result);
        }
        catch(e){
            console.error(e);
        }
    })();
  }, [videoID])

  if (loading) return <div className="watch-loading">로딩 중...</div>;
  if (!video) return <div className="watch-error">영상 정보를 불러올 수 없습니다.</div>;

  return (
    <Main title={video.title} description="">

        <div className="watch">
        <div className="watch__left">
            <video className="watch__player" controls src={video.videoUrl}></video>

            <h1 className="watch__title">{video.title}</h1>

            <div className="watch__meta">
            <div className="watch__channel">
                <img
                src={video.profileUrl || "/fallback-profile.png"}
                alt={video.userName}
                className="watch__avatar"
                />
                <div>
                <div className="watch__channel-name">{video.userName}</div>
                <div className="watch__info">
                    조회수 {fmtViews(video.views)} · {video.createdAt} ·{" "}
                    {video.durationSeconds}
                </div>
                </div>
                <Link to={`/channel/${video.userId}`} className="watch__btn">
                채널 이동
                </Link>
            </div>

            <div className="watch__actions">
                <button>공유</button>
                <button>저장</button>
            </div>
            </div>

            <div className="watch__desc">
            <p className={`watch__desc-text ${descOpen ? "open" : ""}`}>
                {video.description || "설명이 없습니다."}
            </p>
            {video.tags && (
              <div className="watch__tags">
                {video.tags
                  .split(",")                 // , 기준으로 나누기
                  .map(tag => tag.trim())     // 공백 제거
                  .filter(Boolean)            // 빈 문자열 제거
                  .map((tag, idx) => (
                    <Link key={idx} to={`/search?tag=${encodeURIComponent(tag)}`}>
                      #{tag}
                    </Link>
                  ))}
              </div>
            )}
            <button
                onClick={() => setDescOpen(!descOpen)}
                className="watch__more"
            >
                {descOpen ? "간략히" : "더보기"}
            </button>
            </div>
        </div>
        </div>
    </Main>
  );
}
