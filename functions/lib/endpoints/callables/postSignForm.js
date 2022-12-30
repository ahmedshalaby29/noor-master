"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const axios_1 = require("axios");
const firebase_admin_1 = require("firebase-admin");
const querystring_1 = require("querystring");
const common_1 = require("../../common");
const express = require("express");
const utils_1 = require("../../utils");
const cry = require("crypto-js");
const iv = cry.enc.Utf8.parse("1052099214050902");
const key = cry.enc.Utf8.parse("p10zpop213tpDW41");
exports.router = express.Router();
exports.router.post("/postSignForm", async (req, res) => {
    const data = req.body.data;
    const user = req.body.user;
    if (user === null || user === void 0 ? void 0 : user.uid)
        console.warn(`authenicated user ${user === null || user === void 0 ? void 0 : user.uid} is using login captcha checking!`);
    const encr = (x) => cry.AES.encrypt(x, key, {
        iv,
        keySize: 16,
        mode: cry.mode.CBC,
        padding: cry.pad.Pkcs7,
    }).toString();
    const { __VIEWSTATEGENERATOR, __VIEWSTATEENCRYPTED, __EVENTVALIDATION, __VIEWSTATE, cookies: OldCookies, } = data;
    const { name, password, captcha } = data;
    if (checkInputs(data)) {
        const postData = {
            __LASTFOCUS: "",
            __EVENTTARGET: "",
            __EVENTARGUMENT: "",
            __VIEWSTATE,
            __VIEWSTATEENCRYPTED,
            __EVENTVALIDATION,
            __VIEWSTATEGENERATOR,
            hdnLanguage: 1,
            bMtSMB1: "تسجيل الدخول",
            tMbPAN1: name,
            tMbPAR1: encr(password),
            tMbPAG1: captcha,
        };
        try {
            const response = await axios_1.default.post(common_1.LOGIN_ENDPOINT, (0, querystring_1.stringify)(postData), {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    Referer: common_1.LOGIN_ENDPOINT,
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
                    Cookie: OldCookies.join("; "),
                },
                maxRedirects: 0,
            });
            console.log(response.status);
            res.json({ operation: "failed" }).status(500);
        }
        catch (e) {
            if (e.response && e.response.status == 302) {
                console.log(e.response);
                const cookies = (0, utils_1.mergeCookies)(OldCookies, e.response.headers["set-cookie"]);
                if (!(cookies instanceof Array) || !cookies.length) {
                    console.error("success login without returning cookies", e.response);
                    res.json({ operation: "failed" }).status(500);
                }
                try {
                    await common_1.auth.getUserByEmail(name + "@noor.com");
                    try {
                        await common_1.db.collection("cookies").doc(name).delete();
                    }
                    catch (e) { }
                }
                catch (e) {
                    try {
                        console.log(cookies);
                        await common_1.db
                            .collection("cookies")
                            .doc(name)
                            .set({
                            cookies,
                            password,
                            expires: firebase_admin_1.firestore.Timestamp.fromMillis(Date.now() + 1000 * 60 * 60),
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                }
                res.json({ operation: "success", data: cookies }).status(200);
            }
            else {
                console.log(e.response);
                res.json({ operation: "failed" }).status(500);
            }
        }
    }
    else {
        res.json({ operation: "failed" }).status(500);
    }
});
function checkInputs(inputs) {
    if (!(inputs.cookies instanceof Array) || inputs.cookies.length < 2) {
        return false;
    }
    if (inputs.name.length < 4) {
        return false;
    }
    if (inputs.password.length < 4) {
        return false;
    }
    if (inputs.captcha.toString().length != 4) {
        return false;
    }
    return true;
}
//# sourceMappingURL=postSignForm.js.map