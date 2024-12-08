'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const cwd = process.cwd();
const app = express();
const fs = require('fs');
const port = Number(process.argv.pop() || 3000);
const tokenPath = path.join(cwd, './config/token.json');

const storeToken = (tokenObj) => {
    fs.writeFile(
        tokenPath,
        JSON.stringify(tokenObj),
        {
            encoding: 'utf8',
            flag: 'w',
        },
        (err) => {
            if (err) console.log(err);
        }
    );
};

app.use(cors());

app.get('/', (req, res) => {
    res.send(`Running at ${cwd}`);
});

app.get('/auth', (req, res) => {
    let tokenObj = {};

    Object.keys(req.query).forEach(key => {
        tokenObj[key] = req.query[key];
    });

    storeToken(tokenObj);
    res.send(`Received ${JSON.stringify(tokenObj)}`);
});

app.listen(port, () => {
    console.log(`App's listening on URL http://localhost:${port}`);
});
