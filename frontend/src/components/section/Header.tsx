import React from "react";
import { headerMenus, searchKeyword,snsLink } from "../../data/HeaderData";
import { Link , useLocation } from "react-router-dom";
import SnsCompo from "../header/Sns";
import MenuCompo from "../header/Menu";
import KeywordCompo from "../header/Keyword";
import LogoCompo from "../header/Logo";

export default function Header(){

    const location= useLocation();
    return(
        <header id='header'>
            <LogoCompo/>
            <nav className="header_menu">
                <MenuCompo/>
                <KeywordCompo/>
            </nav>
             <SnsCompo/>
        </header>
    );
}