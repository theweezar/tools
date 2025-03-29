(() => {
    let list = document.querySelector('#list-ul');
    let imgQuery = list.querySelectorAll('a.img-wrapper');
    let imgList = [];
    imgQuery.forEach(el => imgList.push(el.getAttribute('href')));
    imgList = imgList.map(link => `https://www.autopilotenergy.com/${link}`);
    console.log(imgList);
})();
