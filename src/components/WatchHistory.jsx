import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import c3 from 'c3';

import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';

export const WatchHistory = () => {

    const [historyObject, setHistoryObject] = useState();
    const [availableYears, setAvailableYears] = useState([]);
    const [analyticsObject, setAnalyticsObject] = useState();

    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endYear, setEndYear] = useState(new Date().getFullYear());

    const monthMap = {
        0: "January",
        1: "February",
        2: "March",
        3: "April",
        4: "May",
        5: "June",
        6: "July",
        7: "August",
        8: "September",
        9: "October",
        10: "November",
        11: "December"
    };

    const dayMap = {
        0: "Sunday",
        1: "Monday",
        2: "Tuesday",
        3: "Wednesday",
        4: "Thursday",
        5: "Friday",
        6: "Saturday"
    };

    const stopwords = ['i','me','my','myself','we','our','ours','ourselves','you','your','yours','yourself','yourselves','he','him','his','himself','she','her','hers','herself','it','its','itself','they','them','their','theirs','themselves','what','which','who','whom','this','that','these','those','am','is','are','was','were','be','been','being','have','has','had','having','do','does','did','doing','a','an','the','and','but','if','or','because','as','until','while','of','at','by','for','with','about','against','between','into','through','during','before','after','above','below','to','from','up','down','in','out','on','off','over','under','again','further','then','once','here','there','when','where','why','how','all','any','both','each','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','s','t','can','will','just','don','should','now'];

    useEffect(() => {
        if (historyObject !== undefined) {
            const first = new Date(historyObject[historyObject.length-1].time).getFullYear();
            let years = [];
            for (let i = first; i <= new Date().getFullYear(); i++) {
                years.push(i);
            }
            years.reverse();
            setAvailableYears(years);
            calculateAnalytics();
        }
    }, [historyObject]);
    
    useEffect(() => {
        if (analyticsObject !== undefined) {
            buildAllPlots();
        }
    }, [analyticsObject]);

    useEffect(() => {
        if (historyObject !== undefined) {
            calculateAnalytics();
        }
    }, [startYear, endYear]);

    /**
     * 
     * @param {File} file 
     */
    function handleFile(file) {
        file.text()
            .then(data => {
                setHistoryObject(JSON.parse(data));
            })
            .catch(e => console.error(e));
    }

    function calculateAnalytics() {
        let numVideos = 0;
        let numChannels = 0;

        let videosByMonth = {};
        let videosByDay = {};
        let videosByHour = {};
        let videosPerChannel = {};
        let titleWordCount = {};

        // Loop through all videos
        for (let vid of historyObject) {
            const time = new Date(vid.time);
            let title = vid.title;
            const titleUrl = vid.titleUrl;

            // Get year range
            if (time.getFullYear() < startYear || time.getFullYear() > endYear) {
                continue;
            }

            // Skip entries that don't start with "Watched "
            if (!title.startsWith("Watched ")) {
                continue;
            }

            numVideos++;

            // Channel info is stored in the subtitles
            // Private or deleted videos don't have subtitles, thus don't have channel info
            if (vid.subtitles) {
                const channel = vid.subtitles[0].name;
                if (!videosPerChannel[channel]) {
                    videosPerChannel[channel] = 0;
                }
                videosPerChannel[channel] += 1;
            }


            // Remove "Watched " from the start of the title
            title = title.substring(8);

            // Count words
            let words = removeStopWords(title);

            for (let word of words) {
                if (!titleWordCount[word]) {
                    titleWordCount[word] = 0;
                }
                titleWordCount[word] += 1;
            }

            // Month
            const month = time.getMonth();
            if (!videosByMonth[month]) {
                videosByMonth[month] = 0;
            }
            videosByMonth[month] += 1;
            
            // Day
            const day = time.getDay();
            if (!videosByDay[day]) {
                videosByDay[day] = 0;
            }
            videosByDay[day] += 1;

            // Hour
            const hour = time.getHours();
            if (!videosByHour[hour]) {
                videosByHour[hour] = 0;
            }
            videosByHour[hour] += 1;
        }

        numChannels = Object.keys(videosPerChannel).length;

        videosByMonth = orderVideosByMonth(videosByMonth);
        videosByDay = orderVideosByDay(videosByDay);
        videosByHour = orderVideosByHour(videosByHour)
        videosPerChannel = orderVideosPerChannel(videosPerChannel);
        titleWordCount = orderTitleWordCount(titleWordCount);

        setAnalyticsObject({
            numVideos,
            numChannels,
            videosByMonth,
            videosByDay,
            videosByHour,
            videosPerChannel,
            titleWordCount
        });
    }

    function removeStopWords(title) {
        let words = [];
        for (let word of title.toLowerCase().split(" ")) {
            if (!stopwords.includes(word) && !/.*([0-9$-/:-?{-~!"^_`\[\]#]|[ ]).*/.test(word) && word !== "") {
                words.push(word);
            }
        }
        return words;
    }

    function orderVideosByMonth(data) {
        data = Object.entries(data);

        data.sort((a, b) => a[0] - b[0]);

        // Get month names from index
        for (let i in data) {
            data[i][0] = monthMap[data[i][0]];
        }

        let months = data.map(x => x[0]);
        let counts = data.map(x => x[1]);

        data = [months, counts];

        return data;
    }

    function orderVideosByDay(data) {
        data = Object.entries(data);

        data.sort((a, b) => a[0] - b[0]);

        // Get month names from index
        for (let i in data) {
            data[i][0] = dayMap[data[i][0]];
        }

        let days = data.map(x => x[0]);
        let counts = data.map(x => x[1]);

        data = [days, counts];

        return data;
    }

    function orderVideosByHour(data) {
        data = Object.entries(data);

        data.sort((a, b) => a[0] - b[0]);

        let hours = data.map(x => x[0]);
        let counts = data.map(x => x[1]);

        data = [hours, counts];

        return data;
    }

    function orderVideosPerChannel(data) {
        data = Object.entries(data);

        // Decreasing sort of counts
        data.sort((a, b) => b[1] - a[1]);
        data = data.slice(0, 10);

        let channels = data.map(x => x[0]);
        let counts = data.map(x => x[1]);

        data = [channels, counts];

        return data;
    }
    
    function orderTitleWordCount(data) {
        data = Object.entries(data);
    
        // Decreasing sort of counts
        data.sort((a, b) => b[1] - a[1]);
        data = data.slice(0, 10);
    
        let words = data.map(x => x[0]);
        let counts = data.map(x => x[1]);
    
        data = [words, counts];
    
        return data;    
    }

    function buildAllPlots() {
        buildPlot("#month-plot", analyticsObject.videosByMonth, "#264653");
        buildPlot("#days-plot", analyticsObject.videosByDay, "#2a9d8f");
        buildPlot("#hours-plot", analyticsObject.videosByHour, "#e9c46a");
        buildPlot("#channel-plot", analyticsObject.videosPerChannel, "#f4a261");
        buildPlot("#words-plot", analyticsObject.titleWordCount, "#e76f51");
    };

    function buildPlot(el, data, color) {
        c3.generate({
            bindto: el,
            data: {
                columns: [
                    ["", ...data[1]]
                ],
                type: "bar",
            },
            bar: {
                width: {
                    ratio: 0.8
                },
            },
            color: {
                pattern: [color]
            },
            axis: {
                x: {
                    type: "category",
                    categories: data[0]
                }
            },
            legend: {
                show: false
            }
        });
    }

    return (
        <>
            <Modal show={!historyObject}>
                <Modal.Header>
                    Upload your Google Takeout File Here
                </Modal.Header>
                <Modal.Body>
                    <Link to="/help">What is this?</Link>
                </Modal.Body>
                <br />
                <Modal.Body>
                    <Form.Control 
                        type="file" 
                        accept=".json" 
                        onChange={e => handleFile(e.target.files[0])}
                    />
                </Modal.Body>
            </Modal>
            <div className="main-container">
                <div className="row">
                    <div className="col-3">
                        <div className="sidebar">
                            <h2>Time Range</h2>
                            <p>Change what years to use for calculating the graphs on the right.</p>
                            <div className="row">
                                <div className="col-6">
                                    <div className="select-label">Start</div>
                                    <Form.Select 
                                        onChange={e => setStartYear(e.target.value)}
                                    >
                                    { 
                                        availableYears.map(year => 
                                            <option value={year}>{year}</option>
                                        )
                                    }
                                    </Form.Select>
                                </div>
                                <div className="col-6">
                                    <div className="select-label">End</div>
                                    <Form.Select
                                        onChange={e => setEndYear(e.target.value)}
                                        disabled={""+startYear === ""+new Date().getFullYear()}
                                    >
                                    { 
                                        availableYears.slice(0, endYear-startYear+1).map(year => 
                                            <option value={year}>{year}</option>
                                        )
                                    }
                                    </Form.Select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-9">
                        <div className="analytics-container">
                            <div id="main-header">
                                <h1>YouTube Stats</h1>
                                <p>{ ""+startYear === ""+endYear ? startYear : `${startYear} to ${endYear}` }</p>
                                <hr />
                            </div>
                            <div className="info-card-row">
                                <Card className="info-card">
                                    <div className="big-num">{ analyticsObject && analyticsObject.numVideos.toLocaleString() }</div>
                                    <Card.Title>Videos</Card.Title>
                                </Card>
                                <Card className="info-card">
                                    <div className="big-num">{ analyticsObject && analyticsObject.numChannels.toLocaleString() }</div>
                                    <Card.Title>Channels</Card.Title>
                                </Card>
                            </div>
                            {analyticsObject &&
                                <div id="plots">
                                    <div className="row">
                                        <div className="col-6 plot">
                                            <h1 className="plot-title">Videos by Month</h1>
                                            <div id="month-plot"></div>
                                        </div>
                                        <div className="col-6 plot">
                                            <h1 className="plot-title">Top Channels</h1>
                                            <div id="channel-plot"></div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-6 plot">
                                            <h1 className="plot-title">Videos by Day</h1>
                                            <div id="days-plot"></div>
                                        </div>
                                        <div className="col-6 plot">
                                            <h1 className="plot-title">Videos by Hour</h1>
                                            <div id="hours-plot"></div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-3"></div>
                                        <div className="col-6 plot">
                                            <h1 className="plot-title">Top Words in Titles</h1>
                                            <div id="words-plot"></div>
                                        </div>
                                        <div className="col-3"></div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
};

export default WatchHistory;