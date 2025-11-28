import { Route, Routes, Navigate } from "react-router-dom";
// import Watch from "@/pages/Watch";
// import Upload from "./pages/Upload";
// import Search from "@/pages/Search";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            {/* <Route path="/watch/:id" element={<Watch />} /> */}
            {/* <Route path="/search" element={<Search />} /> */}

            {/* 로그인/회원가입 */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* 보호 라우트: 업로드 페이지는 로그인 필요 */}
            {<Route
            path="/upload"
              element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              }
            />}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
