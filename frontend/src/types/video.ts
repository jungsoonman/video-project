/**
 * @description : Home.tsx에서 목록을 그릴 때 Page<VideoSummary> 타입을 기대하고 데이터를 읽는다.
 *                Watch.tsx에서는 VideoDetail 타입을 기대하고 플레이어/ 설명 / 태그를 그린다.
 */



//백엔드가 내려주는 영상 요약 정보 의 형태를 타입으로 정의
export type VideoSummary = {
    videoID : number;
    title: string;
    created_at: Date;
    userName : string;
    view: number;
    profileUrl : string;
    thumbNailUrl : string;
    duration : string;
};


//상세 페이지에서 쓰는 타입: 요약 정보 + 상세 필드
export type VideoDetail = {
    videoId: number;
  title: string;
  videoUrl: string;
  durationSeconds: string;
  views: number;
  createdAt: string;
  userId: number;
  userName: string;
  profileUrl?: string;
  description?: string;
  tags?: string;
};

//페이지네이션 응답을 일반화한 제네릭 타입
export type Page<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
};

export type SearchVideo = {
    videoId: number;
  title: string;
  thumbNailUrl: string;
  durationSeconds: string;
  views: number;
  createdAt: string;
  userId: number;
  userName: string;
  profileUrl?: string;
  tags?: string;
};