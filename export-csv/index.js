'use strict';

const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const exportPath = path.join(cwd, 'ignore', 'export');
const entryFileName = 'GTM-WNSLK5J_workspace155.json';
const jsonPath = path.join(cwd, 'ignore', entryFileName);
const gtmJSON = require(jsonPath);

const tags = Array.from(gtmJSON.containerVersion.tag);

const mapTagArr = tags.map(tag => {
    const model = {
        name: tag.name
    };
    const params = Array.from(tag.parameter);
    const paramNames = ['category', 'action', 'label'];

    params.forEach(param => {
        if (param.key === 'eventName') model.eventName = param.value;

        if (param.key === 'eventSettingsTable') {
            const customParams = Array.from(param.list);

            customParams.forEach(customParam => {
                const map = customParam.map;
                if (Array.isArray(map)) {
                    let paramName, paramVal;

                    map.forEach(el => {
                        if (el.key === 'parameter' && paramNames.includes(el.value)) paramName = el.value;
                        if (el.key === 'parameterValue') paramVal = el.value;
                    });

                    // const hasCategory = map.find(el => el.key === 'parameter' && el.value === 'category');
                    // const hasAction = map.find(el => el.key === 'parameter' && el.value === 'action');
                    // const hasLabel = map.find(el => el.key === 'parameter' && el.value === 'label');
                    // const final = hasCategory || hasAction || hasLabel;

                    if (paramName) {
                        model[paramName] = paramVal;
                    }
                }
            });
        }
    });

    return model;
});

fs.writeFileSync(
    path.join(exportPath, entryFileName),
    JSON.stringify(mapTagArr, null, 4)
);
