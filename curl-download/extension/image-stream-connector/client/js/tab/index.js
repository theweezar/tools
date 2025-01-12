'use strict';

async function execute(defaultSendFn) {
    const util = {
        /**
         * Return remote host based on current location
         * @returns {string} - Remote host
         */
        getHost() {
            let hrefURL = new URL(window.location.href);
            let config = {
                'x.com': 'http://127.0.0.1:7346',
                // 'x.com': 'http://127.0.0.1:9001',
                'www.facebook.com': 'http://localhost:3103',
                'facebook.com': 'http://localhost:3103',
            }
            return config[hrefURL.host] || '';
        },
        parseJSON(json) {
            try {
                return JSON.parse(json);
            } catch (error) {
                return null;
            }
        },
        /**
         * Check if the request belongs to Facebook
         * @param {XMLHttpRequest} httpReq - XML HTTP Request
         * @returns {boolean} - Return true if the request belongs to Facebook
         */
        isFacebookRequest(httpReq) {
            let resURL = new URL(httpReq.responseURL);
            return httpReq.status === 200
                && (httpReq.responseType === '' || httpReq.responseType === 'text')
                && httpReq.responseText.includes('currMedia')
                && resURL.pathname.includes('api/graphql');
        },
        /**
         * Check if the request belongs to Twitter/X
         * @param {XMLHttpRequest} httpReq - XML HTTP Request
         * @returns {boolean} - Return true if the request belongs to Twitter/X
         */
        isXRequest(httpReq) {
            let resURL = new URL(httpReq.responseURL);
            return httpReq.status === 200
                && (httpReq.responseType === '' || httpReq.responseType === 'text')
                && resURL.pathname.includes('TweetDetail');
        },
        /**
         * Execute fetch URL
         * @param {string} url - URL
         * @param {boolean|undefined|null} isReturnJSON - Set true to return JSON data instead of response object
         * @returns {Response|Object} - JSON object or Response object
         */
        async execFetch(url, isReturnJSON) {
            try {
                const response = await fetch(url);
                if (isReturnJSON === true) {
                    const json = await response.json();
                    return json;
                }
                return response;
            } catch (error) {
                console.error(error.message);
            }

            return {
                ok: false
            };
        }
    }

    const host = util.getHost();

    const facebook = {
        parseResponse(text) {
            let rows = text.split('\n');
            let responseArray = rows.filter(row => {
                let obj = util.parseJSON(row);
                return !!(obj !== null && obj.data && obj.data.currMedia);
            });
            return responseArray.length > 0 ? util.parseJSON(responseArray[0]) : null;
        },
        getImageURI(responseObj) {
            try {
                return responseObj.data.currMedia.image.uri;
            } catch (error) {
                return null;
            }
        },
        /**
         * Execute function
         * @param {XMLHttpRequest} httpReq - XML HTTP Request
         */
        async executeRemoteCurl(httpReq) {
            let responseObj = this.parseResponse(httpReq.responseText);
            let imageURI = this.getImageURI(responseObj);

            if (imageURI) {
                let connectorURL = new URL(`${host}/curl`);
                connectorURL.searchParams.append('src', encodeURIComponent(imageURI));
                let json = await util.execFetch(connectorURL.toString(), true);
                console.log(json);
            }
        }
    };

    const twitter = {
        /**
         * Get image URI array
         * @param {Object} responseObj 
         * @returns {Array} - Image URI array
         */
        getImageURIs(responseObj) {
            try {
                let instruction = responseObj.data.threaded_conversation_with_injections_v2.instructions.filter(el => {
                    return el.type === 'TimelineAddEntries';
                }).pop();

                let entry = instruction.entries.filter(el => {
                    return el.content.entryType === 'TimelineTimelineItem'
                        && el.content.itemContent.itemType === 'TimelineTweet';
                }).pop();

                let mediaArray = entry.content.itemContent.tweet_results.result.legacy.entities.media;
                
                let mediaUrls = mediaArray.filter(el => {
                    return el.type === 'photo' && el.media_url_https !== null;
                }).map(el => {
                    let url = new URL(el.media_url_https);
                    let dotIdx = url.href.lastIndexOf('.');
                    let ext = url.href.substring(dotIdx + 1);
                    url.searchParams.append('format', ext);
                    url.searchParams.append('name', 'large');
                    return url.toString();
                });

                return mediaUrls;
            } catch (error) {
                return null;
            }
        },
        /**
         * Execute function
         * @param {XMLHttpRequest} httpReq - XML HTTP Request
         */
        async executeRemoteCurl(httpReq) {
            let responseObj = util.parseJSON(httpReq.responseText);
            let imageURIs = this.getImageURIs(responseObj);

            if (imageURIs) {
                let connectorURL = new URL(`${host}/curlArray`);
                imageURIs.forEach(uri => {
                    connectorURL.searchParams.append('src', encodeURIComponent(uri));
                });
                let json = await util.execFetch(connectorURL.toString(), true);
                console.log(json);
            }
        }
    }

    /** Check connection */
    const connection = await util.execFetch(host);
    if (!connection || connection.ok === false) {
        alert('500: Cannot connect to the remote server.');
        return;
    }
    /** */

    window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
            if (util.isFacebookRequest(this)) {
                facebook.executeRemoteCurl(this);
            }

            if (util.isXRequest(this)) {
                twitter.executeRemoteCurl(this);
            }
        });

        return defaultSendFn.apply(this, arguments);
    };

    window.curlConnectorInitialized = true;

    alert('CURL connector is initialized.');
}

if (!window.curlConnectorInitialized) {
    execute(window.XMLHttpRequest.prototype.send);
}
