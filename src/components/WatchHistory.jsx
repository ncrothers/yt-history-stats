import React, { useEffect, useState } from 'react';

import { Link } from 'react-router-dom';

import c3 from 'c3';

import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

import worker from '../workers/calculateStats.js';
import WebWorker from '../workers/workerSetup';

export const WatchHistory = () => {

    const [historyObject, setHistoryObject] = useState();
    const [availableYears, setAvailableYears] = useState([]);
    const [statsObject, setStatsObject] = useState();

    const [startYear, setStartYear] = useState(new Date().getFullYear());
    const [endYear, setEndYear] = useState(new Date().getFullYear());
    const [useSingleYear, setUseSingleYear] = useState(true);

    const [isPlotting, setIsPlotting] = useState(false);

    const statsWorker = new WebWorker(worker);

    useEffect(() => {
        if (historyObject !== undefined) {
            const first = new Date(historyObject[historyObject.length-1].time).getFullYear();
            let years = [];
            for (let i = first; i <= new Date().getFullYear(); i++) {
                years.push(i);
            }
            years.reverse();
            setAvailableYears(years);
            calculateStats();
        }
    }, [historyObject]);
    
    useEffect(() => {
        if (statsObject !== undefined) {
            buildAllPlots();
        }
    }, [statsObject]);

    useEffect(() => {
        if (historyObject !== undefined) {
            if (startYear > endYear) {
                setEndYear(startYear);
            }
            else {
                calculateStats();
            }
        }
    }, [startYear, endYear]);

    useEffect(() => {
        statsWorker.addEventListener("message", event => {
            if (event && event.data) {
                setStatsObject(event.data);
            }
        });
    }, [statsWorker]);

    useEffect(() => {
        if (startYear !== endYear) {
            setEndYear(startYear);
        }
    }, [useSingleYear]);

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

    function calculateStats() {
        setIsPlotting(true);
        statsWorker.postMessage({ msg: "calculateStats", historyObject, startYear, endYear });
    }

    function buildAllPlots() {
        buildPlot("#month-plot", statsObject.videosByMonth, "#264653");
        buildPlot("#days-plot", statsObject.videosByDay, "#2a9d8f");
        buildPlot("#hours-plot", statsObject.videosByHour, "#e9c46a");
        buildPlot("#channel-plot", statsObject.videosPerChannel, "#f4a261");
        buildPlot("#words-plot", statsObject.titleWordCount, "#e76f51");
        setIsPlotting(false);
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

    function updateStartYear(year) {
        setStartYear(year);
        if (useSingleYear) {
            setEndYear(year);
        }
    }

    function updateEndYear(year) {
        if (!useSingleYear) {
            if (startYear > year) {
                setEndYear(startYear);
            }
            else {
                setEndYear(year);
            }
        }
    }

    return (
        <>
            <Modal show={!historyObject} centered>
                <Modal.Header>
                    <h4>Select your Google Takeout File</h4>
                </Modal.Header>
                <Modal.Body>
                    <Link to="/help">How do I get this file?</Link>
                </Modal.Body>
                <br />
                <Modal.Body>
                    <Form.Control 
                        type="file" 
                        accept=".json" 
                        onChange={e => handleFile(e.target.files[0])}
                        />
                    <br />
                    <p>Note: the file you use here <i>never</i> leaves your computer.</p>
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
                                        onChange={e => updateStartYear(e.target.value)}
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
                                        onChange={e => updateEndYear(e.target.value)}
                                        disabled={""+startYear === ""+new Date().getFullYear() || useSingleYear}
                                        value={useSingleYear ? startYear : endYear}
                                    >
                                    { 
                                        availableYears.slice(0, new Date().getFullYear()-startYear+1).map(year => 
                                            <option value={year}>{year}</option>
                                        )
                                    }
                                    </Form.Select>
                                </div>
                            </div>
                            <div id="single-year-container">
                                <Form.Label htmlFor="use-single-year">
                                    <Form.Check 
                                        type="checkbox" 
                                        id="use-single-year"
                                        label="Single year only" 
                                        onClick={e => setUseSingleYear(e.target.checked)}
                                        checked={useSingleYear}
                                    />
                                </Form.Label>
                            </div>
                        </div>
                    </div>
                    <div className="col-9">
                        <div className="analytics-container">
                            <div id="main-header">
                                <h1>YouTube Watch History Stats</h1>
                                <h4>{ ""+startYear === ""+endYear ? startYear : `${startYear} to ${endYear}` }</h4>
                                <Spinner 
                                    id="spinner" 
                                    animation="border" 
                                    role="status" 
                                    className={isPlotting ? "" : "hidden"}>
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner>
                                {/* <hr /> */}
                                <br />
                                <br />
                            </div>
                            <div className="info-card-row">
                                <Card className="info-card">
                                    <div className="big-num">{ statsObject && statsObject.numVideos.toLocaleString() }</div>
                                    <Card.Title>Videos</Card.Title>
                                </Card>
                                <Card className="info-card">
                                    <div className="big-num">{ statsObject && statsObject.numChannels.toLocaleString() }</div>
                                    <Card.Title>Channels</Card.Title>
                                </Card>
                            </div>
                            {statsObject &&
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