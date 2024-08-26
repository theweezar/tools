'use strict';

function processData(data) {
    if (!data) return '';

    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return data;
    }

    if (data.constructor === Object || Array.isArray(data)) {
        return JSON.stringify(data);
    }

    let tempObject = {};
    Object.keys(data).forEach(key => {
        if (typeof data[key] === 'function') {
            tempObject[key] = 'function () {}';
        } else {
            tempObject[key] = data[key];
        }
    });
    return JSON.stringify(tempObject);
}

window.logger = (data) => {
    let url = new URL('http://127.0.0.1:3000/logger/');
    let processedData = processData(data);
    url.searchParams.append('data', encodeURIComponent(processedData));

    fetch(url, {
        method: 'GET'
    })
    .then(res => console.log(res))
    .catch(error => console.log(error));
};

logger('Hello from client...');
logger({
    name: 'SpiderMan',
    city: 'New York'
});

window.jLogger = (data) => {
    let url = new URL('http://127.0.0.1:3000/logger/');
    let processedData = processData(data);
    url.searchParams.append('data', encodeURIComponent(processedData));

    $.ajax({
        url: url.toString()
    }).done(function (res) {
        console.log(res);
    });
};

jLogger('Hello from jQuery Ajax client...');


