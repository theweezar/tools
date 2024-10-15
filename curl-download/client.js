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
