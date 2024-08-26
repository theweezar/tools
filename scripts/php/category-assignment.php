<?php

$categories = array(
    'travel-carry-on', 'travel-checked-luggage', 'travel-garment-bags', 'travel-hardside', 'travel-softcase', 'travel-wheeled-briefcase', 'travel-all',
    'travel-what-new', 'travel-best-seller', 'travel-monogrammable', 'travel-experience-3d-ar',
    'backpack-travel', 'backpack-laptop', 'backpack-leather', 'backpack-all',
    'backpack-what-new', 'backpack-best-seller', 'backpack-monogrammable', 'backpack-experience-3d-ar', 'backpack-tumi-esports',
    'bag-business', 'bag-clutch', 'bag-duffels-satchels', 'bag-cross-body', 'bag-leather', 'bag-tote', 'bag-sling', 'bag-all',
    'bag-what-new', 'bag-best-seller', 'bag-monogrammable', 'bag-experience-3d-ar',
    'accessories-product-care', 'accessories-wallet', 'accessories-passport-covers', 'accessories-travel-companion', 'accessories-travel-essentials', 'accessories-mobile', 'accessories-key-fobs', 'accessories-belt', 'accessories-outerwear', 'accessories-all',
    'accessories-what-new', 'accessories-best-seller', 'accessories-experience-3d-ar', 'accessories-monogrammable', 'accessories-tumi-plus',
    'collection-19-degree-aluminum', 'collection-19-degree', 'collection-19-degree-polycarbonate', 'collection-19-degree-titanium', 'collection-alpha', 'collection-alpha-bravo', 'collection-aribe-arrive', 'collection-harrison', 'collection-ashton', 'collection-belts', 'collection-tahoe', 'collection-electronics', 'collection-esports-pro', 'collection-george-georgica', 'collection-arrive', 'collection-devoe', 'collection-merge', 'collection-key-fobs', 'collection-voyageur', 'collection-latitude', 'collection-nassau', 'collection-tumi-accents', 'collection-mobile-accessory', 'collection-travel-accessories', 'collection-i-mclaren', 'collection-staple', 'collection-razer', 'collection-recycled-capsule', 'collection-tumi-plus', 'collection-tegra-lite', 'collection-view-all', 'collection-tegra-lite-max', 'collection-travel-accessory', 'collection-tumi-latitude', 'collection-umbrellas',
    'gift-ideas-accessories', 'gift-for-her', 'gift-for-him', 'gift-luxury', 'gift-all',
    'gift-new-arrivals', 'gift-best-seller', 'gift-monogrammable'
);

$xml = '';

foreach ($categories as $idx => $category) {
    $xml .= "<category-assignment category-id=\"$category\" product-id=\"tu-139683-1041\"/>\n\n";
}

file_put_contents('category-assignment.xml', $xml);