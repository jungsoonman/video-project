interface ImportMetaEnv{
    readonly VITE_API_BASE_URL: string;
    readonly VITE_MEDIA_BASE_URL: string;
    // 필요한 환경 변수들 계속 추가.
}

interface ImportMeta{
    readonly env: ImportMetaEnv;
}