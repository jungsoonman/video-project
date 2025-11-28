import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import SearchResults from "./SearchResults";
import { SearchVideo } from "../types/video";
import Main from "../components/section/Main";
import { searchVideos } from "../api/video";

export default function SearchResultsPage() {
  const { query } = useParams();
  const [results, setResults] = useState<SearchVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(query);
    if (!query) return;
    setLoading(true);
    (async () => {
      
      const result = await searchVideos(query);

      setResults((list) =>{
        const m = new Map<number, SearchVideo>();
        for (const v of list) m.set(v.videoId, v);
        for (const v of result.content) m.set(v.videoId, v);
        return [...m.values()];
      });
      
    })();
    setLoading(false);
  }, [query]);

  return (
    <Main title="유튜브 채널" description="유튜브 채널 페이지입니다."> 
        <div className="vu container">
        <SearchResults query={query} results={results} loading={loading} />
        </div>
    </Main>
  );
}

