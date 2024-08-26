'use strict';

const express = require('express');
const app = express();
const port = 3000;

function parseData(data) {
    if (!data) return '';

    const decodeData = decodeURIComponent(data);

    try {
        var dataObj = JSON.parse(decodeData);
        return dataObj;
    } catch (error) {}

    if (typeof data === 'string') {
        return decodeData;
    }
}

app.get('/logger', (req, res) => {
    if (req.query && req.query.data) {
        const logMsg = parseData(req.query.data);
        console.log('\nMessage:', logMsg);
    }

    res.json({
        success: true
    });
});

app.listen(port, () => {
    console.log(`Start app on port ${port}`);
});
