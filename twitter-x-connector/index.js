'use strict';

const CONFIG = require('./config/config.json');
const needle = require("needle");
// The code below sets the bearer token from your environment variables
// To set environment variables on macOS or Linux, run the export command below from the terminal:
// export BEARER_TOKEN='YOUR-TOKEN'

const token = CONFIG.bearerToken;
const id = CONFIG.userID;

const endpointURL = `https://api.twitter.com/2/users/${id}/liked_tweets`;

async function getRequest() {
    // These are the parameters for the API request
    // by default, only the Tweet ID and text are returned
    const params = {
        "tweet.fields": "lang,author_id", // Edit optional query parameters here
        "user.fields": "created_at", // Edit optional query parameters here
    };

    // this is the HTTP header that adds bearer token authentication
    const res = await needle("get", endpointURL, params, {
        headers: {
            "User-Agent": "v2LikedTweetsJS",
            authorization: `Bearer ${token}`
        },
    });

    if (res.body) {
        return res.body;
    } else {
        throw new Error("Unsuccessful request");
    }
}

(async () => {
    try {
        // Make request
        const response = await getRequest();
        console.dir(response, {
            depth: null,
        });
    } catch (e) {
        console.log(e);
        process.exit(-1);
    }
    process.exit();
})();