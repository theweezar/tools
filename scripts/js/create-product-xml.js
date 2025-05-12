'use strict';

const path = require('path');
const fs = require('fs');
const cwd = process.cwd();
const fetchedJson = require('../ignore/sskr/20250512_staging_kr-samsonite-products_fetched_ko-KR.json');
const finalXmlPath = path.join(cwd, 'ignore', 'sskr', '20250512_catalog_Samsonites_reviewsummary_sskr_ko-KR.xml');
const prodXmlArray = [];
const locale = 'ko-KR';

Object.keys(fetchedJson).forEach((pageID) => {
    const item = fetchedJson[pageID];
    const pids = item.pids;
    const review = item.review;
    const reviewCount = review ? review.review_count : 0;
    const averageRating = review ? review.average_rating : 0;

    if (reviewCount === 0  || averageRating === 0) {
        return;
    }

    pids.forEach((pid) => {
        prodXmlArray.push(
            `
<product product-id="${pid}">
    <custom-attributes>
        <custom-attribute attribute-id="StarRating" xml:lang="${locale}">${Math.round(averageRating)}</custom-attribute>
        <custom-attribute attribute-id="StarRatingBase" xml:lang="${locale}">${parseFloat(averageRating).toFixed(1)}</custom-attribute>
        <custom-attribute attribute-id="StarRatingCount" xml:lang="${locale}">${reviewCount}</custom-attribute>
    </custom-attributes>
</product>`
        );
    });
});

const finalXml = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="http://www.demandware.com/xml/impex/catalog/2006-10-31" catalog-id="Samsonite">
    ${prodXmlArray.join('\n')}

</catalog>
`;

fs.writeFileSync(finalXmlPath, finalXml);
