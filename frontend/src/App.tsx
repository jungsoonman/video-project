import { Route, Routes, Navigate, BrowserRouter } from "react-router-dom";
import { Suspense, useEffect } from "react";
import Main from "./components/section/Main";
import { lazy } from "react";
import WatchPage from "./pages/watchPage";
import { bootstrapSession } from "./api/auth";


const Home = lazy(()=> import('./pages/Home'));
const LoginModal = lazy(()=> import('./pages/LoginModal'));
const SignUpModal = lazy(()=> import('./pages/SignupModal'));
const Upload = lazy(()=> import('./pages/Upload'));
const SearchPage = lazy(()=>import('./pages/SearchPage'));



export default function App() {



    return(
        <Suspense fallback={<Main/>}>
            <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/today" element={<Home/>}/>
                <Route path="/developer" element={<Home/>}/>
                <Route path="/webd"element={<Home/>}/>
                <Route path="/website" element={<Home/>}/>
                <Route path="/gsap" element={<Home/>}/>
                <Route path="/port" element={<Home/>}/>
                <Route path="/youtube" element={<Home/>}/>
                <Route path="/upload" element={<Upload/>}/>
                <Route path="/watch/:videoID" element={<WatchPage/>}/>
                <Route path="/search/:query" element={<SearchPage />}/>
                <Route path="/*" element={<Home/>}/>
                <Route path="/login" element={<LoginModal/>}/>
                <Route path="/signup" element={<SignUpModal/>}/>
            </Routes>
        </Suspense>
    );
};