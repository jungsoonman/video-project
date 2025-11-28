import React from "react";
import Header from "./Header";
import { Helmet, HelmetProvider } from '@dr.pogodin/react-helmet';
import Footer from "./Footer";
import Search from "./Search";
import Login from "./Login"

type MainProps = {
  title?: string;
  description?:string;
  children?:React.ReactNode;
}

const Main: React.FC<MainProps> = ({ title,description, children }) => {
     return (
        <HelmetProvider>
            <Helmet 
                titleTemplate="%s | Webs Youtube" 
                defaultTitle="Webs Youtube" 
                defer={false}
            >
                {title && <title>{title}</title>}
                <meta name="description" content={description} />
            </Helmet>

            <Header />
            <main id="main" role="main">
              <div className="topBar">
                  <Search />
                  <Login />
              </div>
              {children}
            </main>
            <Footer />
        </HelmetProvider>
    )
};

export default Main;
