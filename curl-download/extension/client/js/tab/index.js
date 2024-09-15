'use strict';

function execute(defaultSendFn) {
    const util = {
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
         * @returns {boolean}
         */
        isFacebookRequest(httpReq) {
            let resURL = new URL(httpReq.responseURL);
            return httpReq.status === 200
                && (httpReq.responseType === '' || httpReq.responseType === 'text')
                && httpReq.responseText.includes('currMedia')
                && resURL.pathname.includes('api/graphql');
        },
        isXRequest(httpReq) {

        },
        async exeFetch(url) {
            try {
                const response = await fetch(url);
                const json = await response.json();
                console.log(json);
            } catch (error) {
                console.error(error.message);
            }
        }
    }

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
        executeRemoteCurl(httpReq) {
            let responseObj = this.parseResponse(httpReq.responseText);
            let imageURI = this.getImageURI(responseObj);

            if (imageURI) {
                let connectorURL = new URL('http://localhost:3103/curl');
                connectorURL.searchParams.append('src', encodeURIComponent(imageURI));
                util.exeFetch(connectorURL.toString())
            }
        }
    };

    window.XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
            if (util.isFacebookRequest(this)) {
                facebook.executeRemoteCurl(this);
            }
        });

        return defaultSendFn.apply(this, arguments);
    };

    window.curlConnectorInitialized = true;

    alert('CURL connector is initialized.');
}

execute(window.XMLHttpRequest.prototype.send);
