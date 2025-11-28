import React from "react";
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/section/Header";
import Main from "./components/section/Main";

import './assets/scss/style.scss';
import { AuthProvider } from "./auth/AuthContext";
import Footer from "./components/section/Footer";

const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });
const rootElement = document.getElementById("root") as HTMLElement; 
const root = ReactDOM.createRoot(rootElement);

root.render(
    <React.StrictMode>
        <QueryClientProvider client={qc}>   
        <BrowserRouter>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
)