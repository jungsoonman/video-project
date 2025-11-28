import Main from "../components/section/Main";
import VideoGrid, { VideoItem } from "./VideoGrid";
import RecommendedRow, { RecoItem } from "./RecommendedRow";
import { useEffect, useRef, useState } from "react";
import { fetchVideos } from "../api/video";
import { Page, VideoSummary } from "../types/video";


const recoData: RecoItem[] = [
      { id:"18", title:"예제 1", channel:"채널 A", views:"12만회", time:"3시간 전", duration:"12:34", thumb:"https://picsum.photos/seed/v1/640/360" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"19", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"20", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"21", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"22", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"23", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"24", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"25", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
  { id:"26", title:"예제 2", channel:"채널 B", views:"5.4만회", time:"1일 전", duration:"08:20", thumb:"https://picsum.photos/seed/v2/640/360", badge:"NEW" ,profileImg: "https://i.pravatar.cc/40?img=2",},
];



export default function Home() {




  return (
    <Main title="유튜브 채널" description="유튜브 채널 페이지입니다.">
        <div style={{padding:"16px"}}>
            <RecommendedRow title="추천 영상"  />
            <VideoGrid  />
        </div>
    </Main>
  );
}