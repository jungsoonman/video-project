import React from "react";

export default function Footer(){
    return(
        <footer id='footer' role="contentinfo">
             <div className="footer__inner">
                <div className="footer__brand">
                <em className="logo"></em>
                <p>VidSpark © 2025 Soonman</p>
                <span>Create • Share • Inspire</span>
                </div>

                <div className="footer__credit">
                <p>Built with Spring Boot · React · Docker · MySQL</p>
                <small>This site is a personal project for portfolio purposes.</small>
                </div>
            </div>
        </footer>
    );

}
    