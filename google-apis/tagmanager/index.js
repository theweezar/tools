'use strict';

const { google } = require('googleapis');
const tagmanager = google.tagmanager('v2');

const oauth2Client = new google.auth.OAuth2(
    '465814068391-64r4785o5j55jk6mtufscv5icc1h2scr.apps.googleusercontent.com',
    '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GOCSPX-yed-9bcrVhSA8RJAm2-16dGutP4y',
    'https://2d43-2001-ee0-4f52-d50-212a-ee4b-14c4-7571.ngrok-free.app/auth'
);

const scopes = [
    'https://www.googleapis.com/auth/tagmanager.readonly',
    'https://www.googleapis.com/auth/tagmanager.edit.containers',
    'https://www.googleapis.com/auth/tagmanager.edit.containerversions'
];

const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',

    // If you only need one scope, you can pass it as a string
    scope: scopes
});

console.log(url);
