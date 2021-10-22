import React from 'react';

export const Help = () => {

    return (
        <div id="help-container" className="container">
            <h1>How to get YouTube watch history from Google Takeout</h1>
            <hr />
            <ol>
                <li>Navigate to <a href="https://takeout.google.com/settings/takeout" target="_blank" rel="noreferrer">Google Takeout</a>.</li>
                <li>If prompted, log in to the Google account from which you want to retrieve YouTube watch history.</li>
                <li>Click "Deselect all".</li>
                <li>Scroll to the bottom and click the checkbox for "YouTube and YouTube Music".</li>
                <li>Click "All YouTube data included".</li>
                <li>Click "Deselect all," then select "history". Click OK.</li>
                <li>Click "Multiple formats," then, next to "History," click "HTML" and change it to "JSON". Click OK.</li>
                <li>Click "Next step," then "Create export".</li>
                <li>You may wait on this page until it is finished, or you can wait for the email indicating it is complete.</li>
                <li>Once it is complete, download the zip file. Unzip the file, and find the <span className="inline-code">watch-history.json</span> file. You can find it in Takeout/YouTube and YouTube Music/history</li>
            </ol>
        </div>
    );
};

export default Help;