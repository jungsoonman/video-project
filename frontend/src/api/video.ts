import { http } from "./http";
import type { Page,VideoDetail , VideoSummary , SearchVideo } from "../types/video";

/**
 * 영상 목록을 페이지네이션으로 조회
 * -Home 페이지 등에서 사용
 * -Page(0-based), size, sort 규약은 백엔드와 합의 필요
 */
// GET /api/videos?page=0&size=12&sort=createdAt,desc
export async function fetchVideos(page = 0,
                                  size =12,
                                  sort : "LATEST" | "OLDEST" | "POPULAR" = "LATEST") {
    
    const {data} = await http.get<Page<VideoSummary>>("/videos",{
        params: {page, size, sort},
    })
    return data; //Page<VideoSummary>
}

/**
 * -단일 영상 상세 조회
 * - Watch 페이지에서 사용
 * GET /api/videos/{id}
 */
export async function fetchvideo(id:String|number) {
    const {data} = await http.get<VideoDetail>(`/videos/${id}`);
    return data;  //VideoDetail
}

/**
 * 영상 업로드 (멀티파트)
 * - Upload 페이지에서 사용
 * - file: File 객체
 * - meta: JSON(제목/설명/태그 등) -> Blob으로 감싸서 전송
 * (백엔드에서 @RequestPart("file"),@RequestPart("meta")로 받도록 구현)
 */
export async function uploadVideo(file:File,
    meta:{title:string; description?:string; tags?:string}
) {
    const form = new FormData();

    //파일 파트
    form.append("file", file);

    //메타 파트
    form.append(
        "meta",
        new Blob([JSON.stringify(meta)], {type: "application/json"})
    );

    //POST /api/videos/upload
    const{data} =  await http.post<VideoDetail>("/videos/upload",
        form,{
            headers: {"Content-Type": "multipart/form-data"},
            onUploadProgress: (e) => {

            },
        });
        return data; //업로드 완료 후 생성된 VideoDetail
    
}

/**
 * 검색 API
 * - Search 페이지에서 사용
 * - q: 검색어, page/size: 페이지네이션
 */
export async function searchVideos(query: string, page = 1 , size =12) {
    const{data} = await http.get<Page<SearchVideo>>("/videos/search",{
        params: {query, page ,size},
    });
    return data;
}

/**
 * 자동완성 / 추천어 API (옵션)
 * -q : 입력중인 문자열을 서버에 전달 -> 제안어 리스트 받기
 * -백엔드가 string[] 반환한다고 가정
 */
export async function suggestKeywords(query:string) {
    const{data} = await http.get<string[]>("/videos/autoComplete",{
        params:{query},
    });
    return data;
}
