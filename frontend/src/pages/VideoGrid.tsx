import React, { useEffect, useRef, useState } from "react";
import { fetchVideos } from "../api/video";
import { Page, VideoSummary } from "../types/video";

export type VideoItem = {
    videoID : number;
    title: string;
    created_at: Date;
    userName : string;
    view: number;
    profileUrl : string;
    thumbNailUrl : string;
    duration : string;
};
export default function VideoGrid() {
  const [items, setItems] = useState<VideoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const lockRef = useRef(false);

  // 1) 페이지 바뀔 때마다 가져오기 (반드시 page 전달!)
  useEffect(() => {
    let alive = true;
    (async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
        // 💡 page/size/sort 제대로 넘기기
        const res = await fetchVideos(page, 12, "LATEST"); // 또는 "createdAt,desc"
        // 중복 제거(같은 id 두 번 붙는 것 방지)
        setItems((prev) => {
          const m = new Map<number, VideoSummary>();
          for (const v of prev) m.set(v.videoID, v);      // 백엔드 키에 맞추세요 (videoID)
          for (const v of res.content) m.set(v.videoID, v);
          return [...m.values()];
        });
        setHasMore(!res.last); // Spring Page의 last 사용
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [page, hasMore]); // page 바뀔 때 실행

  // 2) 무한스크롤: 관찰 콜백
  const handleReachEnd = () => {
    if (loading || !hasMore || lockRef.current) return;
    lockRef.current = true;
    setPage((p) => p + 1);
    setTimeout(() => (lockRef.current = false), 400);
  };

  // 3) IntersectionObserver (loading/hasMore 의존성 포함)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          handleReachEnd();
        }
      },
      { rootMargin: "800px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]); // ✅ 상태 변화를 반영해야 중복 호출/불필요 호출 방지

  return (
    <section className="video-grid">
      {items.map((v) => (
        <article className="video-card" key={v.videoID}>
          <a className="thumb" href={`/watch/${v.videoID}`} title={v.title}>
            <div className="thumb-ratio">
              <img src={v.thumbNailUrl} alt={v.title} loading="lazy" />
            </div>
            <span className="duration">{v.duration}</span>
          </a>

          <div className="meta">
            <div className="meta-head">
              <img src={v.profileUrl} alt={v.userName} className="profile-img" />
              <h3 className="title clamp-2" title={v.title}>{v.title}</h3>
            </div>
            <div className="sub">
              <span className="channel">{v.userName}</span>
              <span className="dot">·</span>
              <span className="views">조회수 {v.view.toLocaleString()}회</span>
            </div>
          </div>
        </article>
      ))}

      {/* ✅ prop onReachEnd 삭제하고, 항상 센티넬 렌더 */}
      <div ref={sentinelRef} className="sentinel" aria-hidden />
    </section>
  );
}