export function worker() {
    /* eslint-disable-next-line no-restricted-globals */
    self.addEventListener("message", event => {
        if (event && event.data && event.data.msg === "calculateStats") {
            const stats = calculateStats(event.data.historyObject, event.data.startYear, event.data.endYear);
            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage(stats);
        }
    });

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

    const stopwords = ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'];

    function calculateStats(historyObject, startYear, endYear) {
        let numVideos = 0;
        let numChannels = 0;

        let videosByMonth = {};
        let videosByDay = {};
        let videosByHour = {};
        let videosPerChannel = {};
        let titleWordCount = {};

        console.log(historyObject);

        
        // Loop through all videos
        // for (let vid of historyObject) {
        for (let i in historyObject) {
            const vid = historyObject[i];
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

            for (let i in words) {
                let word = words[i];
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

        return {
            numVideos,
            numChannels,
            videosByMonth,
            videosByDay,
            videosByHour,
            videosPerChannel,
            titleWordCount
        };
    }

    function removeStopWords(title) {
        let words = [];
        title = title.toLowerCase().split(" ");
        for (let i in title) {
            let word = title[i];
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
};

export default worker;