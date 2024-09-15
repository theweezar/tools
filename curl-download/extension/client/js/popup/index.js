'use strict';

async function getTabModel() {
    const tabs = await chrome.tabs.query({ active: true });
    const thisTab = tabs[0];
    return {
        tab: thisTab
    };
}

async function initConnector() {
    const tabModel = await getTabModel();

    if (!tabModel || !tabModel.tab) return;

    const exe = await chrome.scripting.executeScript({
        target: { tabId: tabModel.tab.id },
        files: ['./client/js/tab/index.js'],
        world: 'MAIN' // This property must be set to execute script in the top document
    });

    return exe;
}

document.addEventListener('DOMContentLoaded', function () {
    const initConnectorBtn = document.getElementById('initConnectorBtn');

    if (!initConnectorBtn) return;

    initConnectorBtn.addEventListener('click', function () {
        initConnector();
    });
});
