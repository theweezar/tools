'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const cmd = require('./helpers/cmd');
const cwd = process.cwd();
const app = express();
const port = 3103;

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
            path.join(cwd, '../ignore/curl', fileName)
        );
    }

    res.json({
        source: src
    });
});

app.listen(port, () => {
    console.log('Example app listening on URL http://localhost:3103');
});
