(() => {
    let list = document.querySelector('#list-ul');
    let imgQuery = list.querySelectorAll('a.img-wrapper');
    let imgList = [];
    imgQuery.forEach(el => imgList.push(el.getAttribute('href')));
    imgList = imgList.map(link => `https://www.autopilotenergy.com/${link}`);
    console.log(imgList);
})();

(function (send) {
    XMLHttpRequest.prototype.send = function () {
        this.addEventListener('load', function () {
            console.log(this.responseText);
        });
        return send.apply(this, arguments);
    };
})(XMLHttpRequest.prototype.send);
