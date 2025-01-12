'use strict';

var currentUrl = new URL(location.href);
var posts = Array.from(document.querySelectorAll('[data-tag=post-title] a')).map(el => {
    let path = el.getAttribute('href');
    return (new URL(path, currentUrl.origin)).href;
});

localStorage.setItem('patreon_post_urls', JSON.stringify(posts));
