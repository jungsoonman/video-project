import React, { useEffect, useMemo, useRef, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { suggestKeywords } from "../../api/video";

type Fetcher = (q: string) => Promise<string[]>;

async function defaultFetcher(q: string): Promise<string[]> {
  if (!q) return [];
  try {
    const res = await suggestKeywords(q);
    return res;
  } catch {
    const demo = [
      "자바 백엔드 면접 질문 모음",
      "리액트로 만드는 유튜브 클론",
      "엘라스틱서치 검색 자동완성",
      "레디스 카운터 성능 최적화",
      "Spring Security JWT 예제",
      "Docker Compose로 개발환경 만들기",
    ];
    return demo.filter(t => t.toLowerCase().includes(q.toLowerCase())).slice(0, 5);
  }
}

function useDebounced<T>(value: T, delay = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

export default function Search({ fetchSuggestions }: { fetchSuggestions?: Fetcher }) {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounced(q, 180);
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const nav = useNavigate();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listboxId = "search-suggest-listbox";
  const fetcher = useMemo<Fetcher>(() => fetchSuggestions ?? defaultFetcher, [fetchSuggestions]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!debouncedQ.trim()) {
        if (alive) {
          setList([]);
          setOpen(false);
          setActiveIndex(-1);
        }
        return;
      }
      const items = await fetcher(debouncedQ.trim());
      if (!alive) return;
      setList(items);
      setOpen(items.length > 0);
      setActiveIndex(items.length ? 0 : -1);
    })();
    return () => {
      alive = false;
    };
  }, [debouncedQ, fetcher]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    nav(`/search/${encodeURIComponent(query)}`);
    setOpen(false);
  };

  const select = (title: string) => {
    setQ(title);
    nav(`/search/${encodeURIComponent(title)}`);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !list.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % list.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(i => (i - 1 + list.length) % list.length);
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < list.length) {
        e.preventDefault();
        select(list[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const onBlur = () => requestAnimationFrame(() => setOpen(false));
  const onFocus = () => list.length && setOpen(true);

  const renderHighlighted = (title: string) => {
    const qTrim = q.trim();
    if (!qTrim) return title;
    const lower = title.toLowerCase();
    const ql = qTrim.toLowerCase();
    const idx = lower.indexOf(ql);
    if (idx === -1) return title;
    return (
      <>
        {title.slice(0, idx)}
        <mark className="auto-mark">{title.slice(idx, idx + qTrim.length)}</mark>
        {title.slice(idx + qTrim.length)}
      </>
    );
  };

  return (
    <div id="search">
      <form className="search_inner" onSubmit={handleSubmit}>
        <label htmlFor="searchInput"><span className="ir">검색</span></label>
        <div className="auto-wrap">
          <input
            ref={inputRef}
            id="searchInput"
            type="search"
            autoComplete="off"
            className="search_input"
            placeholder="검색어"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            onFocus={onFocus}
            aria-expanded={open}
            aria-controls={listboxId}
          />
          <button type="submit" className="btn_search" aria-label="검색">
            <IoSearchSharp />
          </button>
          {open && list.length > 0 && (
            <ul id={listboxId} className="auto-list">
              {list.map((title, i) => (
                <li
                  key={i}
                  className={`auto-item ${i === activeIndex ? "is-active" : ""}`}
                  onMouseDown={(e) => { e.preventDefault(); select(title); }}
                  onMouseEnter={() => setActiveIndex(i)}
                >
                  {renderHighlighted(title)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </form>
    </div>
  );
}
