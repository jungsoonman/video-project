import React from "react";
import { snsLink } from "../../data/HeaderData";


export default function SnsCompo() {

    return(
        <div className='header_sns'>
                <ul>
                    {snsLink.map((sns, key)=>(
                        <li key={key}> 
                            <a href={sns.url} target="_black" rel="noopener noreferrer">{sns.icon}</a>
                        </li>
                    ))}
                </ul>
            </div>
    );
}