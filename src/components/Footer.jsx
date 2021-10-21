import React from "react";

export const Footer = () => {

    return (
        <div className="footer">
            <a href="https://github.com">
                <img src="assets/github-mark.png" id="github-mark" alt="Github logo" />
            </a>
            <div>&copy; {new Date().getFullYear()} Nicholas Crothers</div>

        </div>
    )
};

export default Footer;