function getHeader() {
    return new Promise((resolve, reject) => {
        var req = new XMLHttpRequest();
        req.open('GET', document.location, true);
        req.send(null);
        req.onreadystatechange = function () {
            if (req.readyState === XMLHttpRequest.DONE) {
                var headers = req.getAllResponseHeaders();
                var obj = {};
                headers.split('\r\n').forEach(header => {
                    if (header) {
                        let [key, value] = header.split(': ');
                        obj[key] = value;
                    }
                });
                obj.cookie = document.cookie;
                resolve(obj);
            }
        };
        req.onerror = function () {
            reject(new Error("Network error occurred while fetching headers."));
        }
    });
}

async function downloadVideo(videoUrl) {
    try {
        var siteHeader = window.siteHeader;
        if (!siteHeader) {
            siteHeader = await getHeader();
            window.siteHeader = siteHeader;
            console.log(window.siteHeader);
        }

        const response = await fetch(videoUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });
        if (!response.ok) throw new Error(`Failed to fetch ${videoUrl}`);

        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        return uint8Array;
    } catch (error) {
        console.error("Error downloading video:", error);
    }
    return null;
}

downloadVideo("https://v101.erome.com/2045/fJjqtKFv/7PIfb42p_720p.mp4").then((videoData) => {
    console.log(videoData);
}).catch(error => {
    console.error("Error:", error);
});
