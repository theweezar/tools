'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const cmd = require('./helpers/cmd');
const cwd = process.cwd();
const app = express();
const port = Number(process.argv.pop() || 3000);
const outputPath = path.join(cwd, '../ignore/curl');

app.use(cors());

app.get('/', (req, res) => {
    res.send(`Running at ${cwd}`);
});

app.get('/curl', (req, res) => {
    let src = req.query.src;
    let sourceURL;

    try {
        if (src) {
            src = decodeURIComponent(src);
            sourceURL = new URL(src);
        }
    } catch (error) {
        console.log(error);
    }

    if (sourceURL) {
        let fileName = sourceURL.pathname.split('/').pop();
        cmd.exeCurl(
            sourceURL.toString(),
            path.join(outputPath, fileName)
        );
    }

    res.json({
        source: src
    });
});

app.get('/curlArray', (req, res) => {
    let src = req.query.src;
    let srcArray = [];

    if (src && typeof src === 'string') {
        srcArray.push(src);
    }

    if (src && Array.isArray(src)) {
        srcArray = srcArray.concat(src);
    }

    srcArray.forEach(src => {
        try {
            let sourceURL = new URL(decodeURIComponent(src));
            if (sourceURL) {
                let fileName = sourceURL.pathname.split('/').pop();
                cmd.exeCurl(
                    sourceURL.toString(),
                    path.join(outputPath, fileName)
                );
            }
        } catch (error) {
            console.log(error);
        }
    });

    res.json({
        sources: srcArray
    });
});

app.listen(port, () => {
    console.log(`Example app listening on URL http://localhost:${port}`);
});
