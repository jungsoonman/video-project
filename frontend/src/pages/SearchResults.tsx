import React, { memo } from "react";
import { Link } from "react-router-dom";
import type { SearchVideo } from "../types/video";

type Props = {
  query?: string;
  results: SearchVideo[];
  loading?: boolean;
  onItemClick?: (videoId: number) => void;
  onMoreClick?: (videoId: number) => void;
  onTagClick?: (tag: string) => void;
  /** 선택: id→url 매핑 or 함수로 썸네일 주입 가능 */
  thumbnailById?: Record<number, string>;
  getThumbnailUrl?: (v: SearchVideo) => string | undefined;
  watchPathBuilder?: (videoId: number) => string;
  thumbnailFallbackSrc?: string;
  avatarFallbackSrc?: string;
};

function splitTags(tags?: string): string[] {
  if (!tags) return [];
  return tags
    .split(/[,;\s]+/g)
    .map((t) => t.trim())
    .filter(Boolean);
}

const SearchResults = ({
  query,
  results,
  loading,
  onItemClick,
  onMoreClick,
  onTagClick,
  thumbnailById,
  getThumbnailUrl,
  watchPathBuilder = (id) => `/watch/${encodeURIComponent(String(id))}`,
  thumbnailFallbackSrc = "/thumb-fallback.png",
  avatarFallbackSrc = "/avatar-fallback.png",
}: Props) => {
  return (
    <section className="srch" aria-busy={loading || undefined}>
      {query && (
        <header className="srch__header">
          <h2 className="srch__title">“{query}” 검색 결과</h2>
          <span className="srch__count">
            {loading ? "불러오는 중…" : `${results.length}개`}
          </span>
        </header>
      )}

      {loading ? (
        <SkeletonList />
      ) : results.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="srch__list" role="list">
          {results.map((v) => {
            const to = watchPathBuilder(v.videoId);
            // ✅ 우선순위: v.thumbnailUrl → thumbnailById → getThumbnailUrl → fallback
            const thumb =
              (v as any).thumbNailUrl ||
              thumbnailById?.[v.videoId] ||
              getThumbnailUrl?.(v) ||
              thumbnailFallbackSrc;

            const avatar = v.profileUrl || avatarFallbackSrc;
            const tags = splitTags(v.tags);

            return (
              <li key={v.videoId} className="srch-item">
                <Link
                  className="srch-item__thumb"
                  to={to}
                  onClick={() => onItemClick?.(v.videoId)}
                  aria-label={`${v.title} 동영상 열기`}
                >
                  <img
                    src={thumb}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (img.src !== thumbnailFallbackSrc) img.src = thumbnailFallbackSrc;
                    }}
                  />
                  {v.durationSeconds && (
                    <span className="pill pill--time">{v.durationSeconds}</span>
                  )}
                </Link>

                <div className="srch-item__body">
                  <h3 className="srch-item__title" title={v.title}>
                    <Link to={to} onClick={() => onItemClick?.(v.videoId)}>
                      {v.title}
                    </Link>
                  </h3>

                  <div className="srch-item__meta">
                    <img
                      className="srch-item__avatar"
                      src={avatar}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (img.src !== avatarFallbackSrc) img.src = avatarFallbackSrc;
                      }}
                    />
                    <span className="creator">{v.userName}</span>
                    <span className="dot" aria-hidden="true">•</span>
                    <span>조회수 {v.views.toLocaleString()}회</span>
                    <span className="dot" aria-hidden="true">•</span>
                    <span>{v.createdAt}</span>
                  </div>

                  {tags.length > 0 && (
                    <div className="srch-item__badges">
                      {tags.map((t, i) => (
                        <button
                          key={`${v.videoId}-tag-${i}`}
                          type="button"
                          className="chip as-button"
                          onClick={() => onTagClick?.(t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="srch-item__more"
                  aria-label="옵션 열기"
                  onClick={() => onMoreClick?.(v.videoId)}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="5" cy="12" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default memo(SearchResults);

function EmptyState() {
  return (
    <div className="srch-empty">
      <div className="ico" aria-hidden="true">🔎</div>
      <p>검색 결과가 없습니다.</p>
      <small>검색어를 조금 더 구체적으로 입력하거나 필터를 조정해 보세요.</small>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="srch__list" role="list" aria-busy="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="srch-item is-skel">
          <div className="srch-item__thumb skel-box" />
          <div className="srch-item__body">
            <div className="skel-line w-80" />
            <div className="skel-line w-60" />
            <div className="skel-line w-40" />
          </div>
          <div className="srch-item__more skel-dot" />
        </li>
      ))}
    </ul>
  );
}
