'use strict';

async function showPIDs() {
    let tabs = await chrome.tabs.query({ active: true });
    let tab = tabs[0];

    if (!tab) return;

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            let page = document.querySelector('.page[data-action="Search-Show"]');

            if (!page) {
                alert('No Search-Show page found!');
                return;
            }

            let productTiles = page.querySelectorAll('.product-grid .product[data-pid]');

            /**
             * Prepend a div to the tile with the PID
             * @param {Element} tile - The tile element
             * @param {string} pid - The Product ID
             */
            let prependDivToTile = (tile, pid) => {
                let wrapper = tile.querySelector('.product-tile .tile-body .tile-group-left');
                if (!wrapper) {
                    return;
                }
                let curDiv = wrapper.querySelector('.product-tile-pid');
                if (curDiv) {
                    curDiv.remove();
                }
                let div = document.createElement('div');

                div.style.color = 'red';
                div.style.fontWeight = 'bold';
                div.classList.add('product-tile-pid');
                div.innerText = pid;

                wrapper.prepend(div);
            };

            let pids = Array.from(productTiles).map(tile => {
                let pid = tile.getAttribute('data-pid');
                prependDivToTile(tile, pid);
                return pid;
            });

            console.log(pids.join('\n'));
        },
        world: 'MAIN'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('showPIDs')?.addEventListener('click', function () {
        showPIDs();
    });
});
