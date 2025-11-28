import React from "react";
import {  searchKeyword } from "../../data/HeaderData";
import { Link ,  } from "react-router-dom";


export default function KeywordCompo(){
   
   
    return(
        <ul className='keyword'>
            {searchKeyword.map((keyword, key)=>(
            <li key={key} className={location.pathname=== keyword.src? 'active':''}>
                <Link to={keyword.src}>
                    {keyword.title}
                </Link>
            </li>
            ))}
        </ul>
    )
}