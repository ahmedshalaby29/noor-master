"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
const common_1 = require("../../common");
const utils_1 = require("../../utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/signForm", async (req, res) => {
    console.log("signForm hit");
    const response = await axios_1.default.get(common_1.LOGIN_ENDPOINT, {
        headers: {
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
            Referer: "https://noor.moe.gov.sa/Noor/logout.aspx",
            "Referrer-Policy": "strict-origin-when-cross-origin",
        },
    });
    const cookies = response.headers["set-cookie"] || [];
    const html = response.data;
    const $ = (0, cheerio_1.load)(html);
    const captachUrl = "https://noor.moe.gov.sa/Noor/" + $("#img_Captcha").attr("src");
    const { data } = await axios_1.default.get(captachUrl, {
        headers: {
            Cookie: cookies.join("; "),
            Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
            Referer: common_1.LOGIN_ENDPOINT,
        },
        responseType: "arraybuffer",
    });
    const captcha = Buffer.from(data, "binary").toString("base64");
    const params = (0, utils_1.hiddenInputs)($);
    res.json(Object.assign(Object.assign({ captcha }, params), { cookies }));
});
//# sourceMappingURL=signForm.js.map