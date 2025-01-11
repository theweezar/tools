(() => {
    let list = document.querySelector('#list-ul');
    let imgQuery = list.querySelectorAll('a.img-wrapper');
    let imgList = [];
    imgQuery.forEach(el => imgList.push(el.getAttribute('href')));
    imgList = imgList.map(link => `https://www.autopilotenergy.com/${link}`);
    console.log(imgList);
})();

// Patreon
(() => {
    let linkEls = document.querySelectorAll('[data-tag="post-attachments"] a[data-tag="post-attachment-link"]');
    let links = [];
    let url = new URL(window.location.href);
    linkEls.forEach(el => {
        links.push(`${url.protocol}//${url.hostname}${el.getAttribute('href')}`);
    });
    console.log(links);
})();

// Patreon post link
(() => {
    const getProp = (t, r) => { if (!t || !r) return null; let e = t, f = r.split("."); if (e) for (; f.length;) { if (e = e[f.shift()], !e) break } return e };
    const nextDataJSON = document.querySelector('script[id="__NEXT_DATA__"]').innerText;
    const nextData = JSON.parse(nextDataJSON);

    if (nextData) {
        let included = getProp(nextData, 'props.pageProps.bootstrapEnvelope.pageBootstrap.post.included');

        if (Array.isArray(included)) {
            console.log(
                included.map(el => {
                    return getProp(el, 'attributes.image_urls.original');
                }).filter(link => !!link)
            );
        }
    }
})();
