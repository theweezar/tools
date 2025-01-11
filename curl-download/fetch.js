const { default: fetch } = require("node-fetch");

(async () => {
    const response = await fetch("https://www.patreon.com/posts/free-wallpapers-119594843", {
        "headers": {
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,zh-TW;q=0.6,zh;q=0.5",
            "cache-control": "no-cache",
            "pragma": "no-cache",
            "priority": "u=0, i",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "same-origin",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "cookie": "patreon_device_id=4a042cb4-4511-40b7-8afb-ef2892a88f26; patreon_location_country_code=VN; patreon_locale_code=en-US; __ssid=3bc3345b0b963641c34b8fb37754070; g_state={\"i_l\":0}; session_id=mgycZOhSZBFSmVOl5j5auyLG2_ciax1x1dr2LY_dpT8; patreon_locale_code=en-US; __cf_bm=jC1wXETDM0q_BHJIJZnQt9YWTMax5ZVYgZy_i3QgvbM-1736570041-1.0.1.1-owz58rXyMBTUL.oi6s5e8v1t5guLDrLhLY7CpuN0aPcyx3IPusoV_6._vO4d2mRNYgNWOt_irhhuv4G2W0sgtbRlDsc0ewksKbrZtEs.Wkk; analytics_session_id=82c2ee3d-1cc3-4cb4-9695-594ed2ff17fa"
        },
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": null,
        "method": "GET"
    });

    const body = await response.text();

    console.log(body);
})();
