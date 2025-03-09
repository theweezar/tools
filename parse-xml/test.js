'use strict';

const UnlimitedObject = require('./lib/unlimited-object');

function doTest() {
    const testData = Array.from({ length: 20000 }, (_, i) => i + 1);
    const uObject = new UnlimitedObject(2000);

    const cb = (currData, inData) => {
        if (inData % 2 === 0) return `even_${inData}`;
        return inData;
    }

    testData.forEach((el, idx) => {
        uObject.set(`key${idx}`, el, cb);
    });
    console.log(uObject.data);
}

doTest();
