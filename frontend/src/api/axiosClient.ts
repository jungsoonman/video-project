import { http } from "./http";
import { getAccessToken } from "./auth";

http.interceptors.request.use((config) =>{
    const token = getAccessToken();
    if(token){
        config.headers = config.headers || {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});
