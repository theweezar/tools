'use strict';

// https://developer.chrome.com/docs/extensions/reference/api/tabs#method-query


let imgUrls = [];

async function getCollectionTabs() {
    const tabs = await chrome.tabs.query({});
    return Array.isArray(tabs) ? tabs.filter(tab => {
        let url = new URL(tab.url);
        return url.host === 'www.patreon.com' && url.pathname.includes('/collection');
    }) : [];
}

async function init() {
    const tabs = await getCollectionTabs();

    for (let idx = 0; idx < tabs.length; idx++) {
        const tab = tabs[idx];

        // Get post data from tab local storage to the extension
        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                var currentUrl = new URL(location.href);
                return Array.from(document.querySelectorAll('[data-tag=post-title] a')).map(el => {
                    let path = el.getAttribute('href');
                    return (new URL(path, currentUrl.origin)).href;
                });
            },
            world: 'MAIN'
        }, (injectionResult) => {
            let postUrlResult = injectionResult[0].result;

            if (Array.isArray(postUrlResult)) {
                postUrlResult = postUrlResult.slice(0, 3);
                postUrlResult.forEach(async (postUrl) => {
                    await chrome.tabs.create({ url: postUrl });
                });
            }
        });
    }
}

async function getPostTabs() {
    const tabs = await chrome.tabs.query({});
    return Array.isArray(tabs) ? tabs.filter(tab => {
        let url = new URL(tab.url);
        return url.host === 'www.patreon.com' && url.pathname.includes('/posts');
    }) : [];
}

async function fetchImage() {
    const imgTabs = await getPostTabs();

    imgUrls = [];

    for (let idx = 0; idx < imgTabs.length; idx++) {
        const imgTab = imgTabs[idx];
        // Set posts into local storage
        await chrome.scripting.executeScript({
            target: { tabId: imgTab.id },
            func: () => {
                const getProp = (t, r) => { if (!t || !r) return null; let e = t, f = r.split("."); if (e) for (; f.length;) { if (e = e[f.shift()], !e) break } return e };
                const nextDataEl = document.querySelector('script[id="__NEXT_DATA__"]');

                if (nextDataEl) {
                    try {
                        const nextData = JSON.parse(nextDataEl.innerText);
                        const included = getProp(nextData, 'props.pageProps.bootstrapEnvelope.pageBootstrap.post.included');

                        if (Array.isArray(included)) {
                            return included.map(el => {
                                return getProp(el, 'attributes.image_urls.original');
                            }).filter(link => !!link);
                        }
                    } catch (error) { }
                }

                return [];
            },
            world: 'MAIN'
        }, (injectionResult) => {
            let imgUrlResult = injectionResult[0].result;
            if (Array.isArray(imgUrlResult)) {
                imgUrls = imgUrls.concat(imgUrlResult);
            }

            document.getElementById('result').innerText = `Captured ${imgUrls.length} image links.`;
        });
    }
}

function downloadImageUrlFile() {
    const link = document.createElement('a');
    const file = new Blob([JSON.stringify(imgUrls)], { type: 'text/json' });
    link.href = URL.createObjectURL(file);
    link.download = "entry.json";
    link.click();
    URL.revokeObjectURL(link.href);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('openPost').addEventListener('click', function () {
        init();
    });
    document.getElementById('fetchImg').addEventListener('click', function () {
        fetchImage();
    });
    document.getElementById('download').addEventListener('click', function () {
        downloadImageUrlFile();
    });
});
