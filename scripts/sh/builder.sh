#!/bin/bash

workdir="/d/samsonite-all-projects/"

declare -a cartridges=(
    # app_custom_americantourister
    # app_custom_americantouristerau
    # app_custom_americantouristerau_merge
    # app_custom_americantouristerhk
    # app_custom_americantouristerhk_merge
    # app_custom_americantouristerkr
    # app_custom_americantouristerkr_merge
    # app_custom_americantouristermy
    # app_custom_americantouristermy_merge
    # app_custom_americantouristerph
    # app_custom_americantouristerph_merge
    # app_custom_americantouristersg
    # app_custom_americantouristersg_merge
    # app_custom_americantouristerth
    # app_custom_americantouristerth_merge
    # app_custom_americantouristertw
    # app_custom_americantouristertw_merge
    # app_custom_au
    # app_custom_core
    # app_custom_gregory
    # app_custom_gregorykr
    # app_custom_gregorykr_merge
    # app_custom_highsierra
    # app_custom_highsierraau
    # app_custom_highsierraau_merge
    # app_custom_hk
    # app_custom_id
    # app_custom_in
    app_custom_jp
    # app_custom_kr
    # app_custom_my
    # app_custom_newtumi
    # app_custom_newtumiau_merge
    # app_custom_newtumihk_merge
    # app_custom_newtumijp_merge
    # app_custom_newtumikr_merge
    # app_custom_newtumimy_merge
    # app_custom_newtumisg_merge
    # app_custom_ph
    app_custom_samsonite
    # app_custom_samsonite_merge
    # app_custom_samsoniteau
    # app_custom_samsoniteau_merge
    # app_custom_samsonitehk
    # app_custom_samsoniteid
    # app_custom_samsoniteid_merge
    # app_custom_samsonitein
    # app_custom_samsonitein_merge
    app_custom_samsonitejp
    app_custom_samsonitejp_merge
    # app_custom_samsonitekr
    # app_custom_samsonitekr_merge
    # app_custom_samsonitemy
    # app_custom_samsonitemy_merge
    # app_custom_samsonitenz
    # app_custom_samsonitenz_merge
    # app_custom_samsoniteph
    # app_custom_samsoniteph_merge
    # app_custom_samsonitesg
    # app_custom_samsonitesg_merge
    # app_custom_samsoniteth
    # app_custom_samsoniteth_merge
    # app_custom_samsonitetw
    # app_custom_samsonitetw_merge
    # app_custom_sg
    # app_custom_th
    # app_custom_tumi
    # app_custom_tumiau
    # app_custom_tumiau_merge
    # app_custom_tumiid
    # app_custom_tumiid_merge
    # app_custom_tumijp
    # app_custom_tumijp_merge
    # app_custom_tumikr
    # app_custom_tumikr_merge
    # app_custom_tumimy
    # app_custom_tumimy_merge
    # app_custom_tumisg
    # app_custom_tumisg_merge
    # app_custom_tumith
    # app_custom_tumith_merge
    # app_custom_tw
    # cartridges
    # custom-feeds
    # int_2c2p_sfra
    # int_asiapay_sfra
    # int_blubox_sfra
    # int_ccavenue_sfra
    # int_clutch_kr
    # int_ecpay_sfra
    # int_emarsys_sfra
    # int_grabpay_sfra
    # int_inicis_sfra
    # int_ipay88_sfra
    # int_linemini
    # int_midtrans_sfra
    # int_naverpay_sfra
    # int_oms_api
    # int_oms_jp
    # int_paynamics_sfra
    # int_perkd_ocapi
    # int_relate_sfra
    # int_sirclo_sfra
    # lib_employeepurchase
    # lib_productlist
    # link_afterpay
    # link_amazonpay_sfra
    # link_atome
    # link_braintree
    # link_clutch
    # link_cybersource
    # link_gmo
    # link_linepay
    # link_paygent
    # link_paypal
    # link_powerreviews
    # link_smartpay
    # marketing-cloud-connector
    # mulesoft-connector-for-b2c-commerce
    # plugin_clickandcollect
    # plugin_coupongenerator
    # plugin_dis
    # plugin_facebooktracking
    # plugin_giftcertificates
    # plugin_googlerecaptcha
    # plugin_googletracking
    # plugin_instockavailability
    # plugin_instorepickup
    # plugin_luggagecover
    # plugin_monogram
    # plugin_productcompare
    # plugin_pushnotifications
    # plugin_referralbenefit
    # plugin_searchbox
    # plugin_selectivecoupon
    # plugin_wishlists
    # samsonite-service-cloud
    # storefront-reference-architecture
)

{
    npm --version
} || {
    echo "npm is not installed"
    exit 0
}

{
    git --version
} || {
    echo "GIT is not installed"
    exit 0
}

for c in "${cartridges[@]}"
do
    cd $workdir$c
    printf "\n---\nGoto $workdir$c\n"

    # ./builder.sh -scss
    if [ "$1" = "-scss" ];
    then
        npm run compile:scss
    fi

    # ./builder.sh -js
    if [ "$1" = "-js" ];
    then
        export NODE_ENV=development && npm run compile:js
    fi

    # ./builder.sh -both
    if [ "$1" = "-both" ];
    then
        export NODE_ENV=development && npm run compile:js
        npm run compile:scss
    fi

    # ./builder.sh -install
    if [ "$1" = "-install" ];
    then
        sed -i -E 's/"node-sass":([^,]*)/"node-sass": "^4.14.1"/g' package.json
        npm i
        git checkout -- .
    fi

    # ./builder.sh -hardinstall
    if [ "$1" = "-hardinstall" ];
    then
        rm -rf node_modules
        rm package-lock.json
        sed -i -E 's/"node-sass":([^,]*)/"node-sass": "^4.14.1"/g' package.json
        npm i
        git checkout -- .
    fi

    # ./builder.sh -clone
    if [ "$1" = "-clone" ];
    then
        git clone https://Duc3010@bitbucket.org/globee-software/$c.git
    fi

    # ./builder.sh -master
    if [ "$1" = "-master" ];
    then
        git checkout -- .
        git checkout master
        git pull origin master
    fi

    # ./builder.sh -development
    if [ "$1" = "-dev" ];
    then
        git checkout -- .
        git checkout development
        git pull origin development
    fi

    # ./builder.sh -lint
    if [ "$1" = "-lint" ];
    then
        git checkout -- .
        node -p "let c = require('./.eslintrc.json');c.rules['define-property-no-writable'] = 'error';c.rules['no-three-parameter-replace'] = 'error';JSON.stringify(c);" > temp.json
        rm .eslintrc.json
        mv temp.json .eslintrc.json
        npx eslint --ext .js --rulesdir ../rules .
        git checkout -- .
    fi
done
