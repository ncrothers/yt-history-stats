import React from "react";

export const Footer = () => {

    return (
        <div className="footer">
            <a href="https://github.com/ncrothers/yt-history-stats">
                <img src="assets/github-mark.png" id="github-mark" alt="Link to Github Repo" />
            </a>
            <div>&copy; {new Date().getFullYear()} Nicholas Crothers</div>

        </div>
    )
};

export default Footer;