import React from "react";
import { headerMenus,  } from "../../data/HeaderData";
import { Link  } from "react-router-dom";


export default function MenuCompo(){

    return(
        <ul className="menu">
            {headerMenus.map((menu, key)=>(
                <li key={key} className={location.pathname === menu.src ? 'active': ''}>
                    <Link to={menu.src}>
                        {menu.icon}
                        {menu.title}
                    </Link>
                </li>
            ))}
        </ul>
    )
}