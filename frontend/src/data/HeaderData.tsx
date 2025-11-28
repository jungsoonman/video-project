import { CiBaseball } from "react-icons/ci";
import { CiCoins1 } from "react-icons/ci";
import { CiBoxes } from "react-icons/ci";
import { CiBullhorn } from "react-icons/ci";
import { CiCoffeeCup } from "react-icons/ci";
import { CiDumbbell } from "react-icons/ci";
import { CiFries } from "react-icons/ci";
import { CiMoneyBill } from "react-icons/ci";
import { JSX } from "react";
import { IconType } from "react-icons";  

import { AiFillGithub } from "react-icons/ai";
import { AiOutlineCodepen } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
import { AiOutlineInstagram } from "react-icons/ai";
import { ReactNode } from "react";

interface HeaderMenus {
    title : string;
    icon : JSX.Element;
    src: string;
}

interface SnsMenus{
    title : string;
    url : string;
    icon: JSX.Element;
}

interface searchKeywordType {
    title : string;
    src : string;
}

export const headerMenus: HeaderMenus[] = [
    {
        title: "JSM youtube",
        icon:  <CiBaseball/> ,
        src: "/",
    },
    {
        title: "추천 영상",
        icon: <CiBaseball/>,
        src: "/today"
    },
    {
        title: "추천 개발자",
        icon: <CiBaseball/>,
        src: "/developer"
    },
    // {
    //     title: "웹디자인기능사",
    //     icon: <CiBoxes />,
    //     src: "/webd"
    // },
    // {
    //     title: "웹표준 사이트",
    //     icon: <CiBullhorn />,
    //     src: "/website"
    // },
    // {
    //     title: "GSAP Parallax",
    //     icon: <CiCoffeeCup />,
    //     src: "/gsap"
    // },
    // {
    //     title: "포트폴리오 사이트",
    //     icon: <CiDumbbell />,
    //     src: "/port"
    // },
    // {
    //     title: "유튜브 클론 사이트",
    //     icon: <CiFries />,
    //     src: "/youtube"
    // },
];

export const searchKeyword : searchKeywordType[]= [
    {
        title: "Jsm",
        src: "/search/JsmYoutube"
    },
    {
        title: "HTML",
        src: "/search/html"
    },
    {
        title: "CSS",
        src: "/search/css"
    },
    {
        title: "TypeScript",
        src: "/search/javascript"
    },
    {
        title: "React.js",
        src: "/search/react.js"
    },
    {
        title: "Java",
        src: "/search/vue.js"
    },
    {
        title: "Redis",
        src: "/search/next.js"
    },
    {
        title: "ElasticSearch",
        src: "/search/node.js"
    },
    {
        title: "SQL",
        src: "/search/sql"
    },
    {
        title: "Spring",
        src: "/search/React Portfolio"
    },
    {
        title: "portfolio",
        src: "/search/portfolio"
    }
];

export const snsLink : SnsMenus[]= [
    { 
        title: "github",
        url: "",
        icon: <AiFillGithub/>
    },
    {
        title: "youtube",
        url: "",
        icon: <AiFillYoutube/>
    },
    {
        title: "codepen",
        url: "",
        icon: <AiOutlineCodepen/>
    },
    {
        title: "instagram",
        url: "",
        icon: <AiOutlineInstagram/>
    },
]