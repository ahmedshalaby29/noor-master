"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.navigateToForm = exports.router = void 0;
const cheerio_1 = require("cheerio");
const common_1 = require("../../../common");
const form_1 = require("../../../core/form");
const redirect_1 = require("../../../core/redirect");
const helpers_1 = require("../../../helpers");
const utils_1 = require("../../../utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/navigation", async (req, res) => {
    var _a;
    try {
        const data = req.body.data;
        const user = req.body.user;
        if (await (0, common_1.isBlocked)(user))
            return null;
        //returns Redirect data instance
        const homePage = await redirect_1.default.start({
            from: (_a = data.from) !== null && _a !== void 0 ? _a : "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
            cookies: data.cookies,
        });
        const { secondNav, form } = await navigateToForm(homePage, data);
        res.json(secondNav.sendForm(form)).status(200);
    }
    catch (error) {
        console.log(error.error);
        res.status(500);
    }
});
async function navigateToForm(homePage, data) {
    const checkAccount = await homePage.nextIf(async (config) => {
        if (!data.account)
            return false;
        const home = await (0, helpers_1.extractHomeData)(config.html);
        return !home.currentAccount.includes(data.account);
    }, async (config) => {
        const home = await (0, helpers_1.extractHomeData)(config.html);
        const accountId = home.allAccounts.find((e) => e.text == data.account).id;
        return {
            target: "SwitchUserTypeMenu",
            to: accountId,
            weirdData: home.weirdData,
        };
    });
    const ensurecheckAccount = await checkAccount.nextIf(async (config) => {
        if (!data.account)
            return false;
        const home = await (0, helpers_1.extractHomeData)(config.html);
        return !home.currentAccount.includes(data.account);
    }, async (config) => {
        const home = await (0, helpers_1.extractHomeData)(config.html);
        //#endregion
        const accountId = home.allAccounts.find((e) => e.text == data.account).id;
        return {
            target: "SwitchUserTypeMenu",
            to: accountId,
            weirdData: home.weirdData,
        };
    });
    const firstNav = await ensurecheckAccount.next(async (config) => {
        const home = await (0, helpers_1.extractHomeData)(config.html);
        const nav1Id = home.navigation.find((e) => e.text == data.nav1)
            ? home.navigation.find((e) => e.text == data.nav1).id
            : "";
        console.log("##### YAYYYY first step1s!");
        return {
            target: "MenuItemRedirect",
            to: nav1Id,
            weirdData: home.weirdData,
        };
    });
    const ensureFirstNav = await firstNav.nextIf(async (config) => {
        //  const nav2Ids = await innerNavigation(config.html);
        return checkPageTitle(config.html);
    }, async (config) => {
        const home = await (0, helpers_1.extractHomeData)(config.html);
        console.log("106 data.nav1 " + data.nav1 + "home.navigation " + home.navigation);
        const nav1Id = home.navigation.find((e) => e.text == data.nav1).id;
        console.log("##### YAYYYY [FORCED] first step!");
        return {
            target: "MenuItemRedirect",
            to: nav1Id,
            weirdData: home.weirdData,
        };
    });
    const secondNav = await ensureFirstNav.next(async (config) => {
        var _a, _b;
        const nav2Ids = await innerNavigation(config.html);
        console.log("121 nav2Ids " + nav2Ids + "data.nav2 " + data.nav2);
        const nav2Id = (_b = (_a = nav2Ids.find((e) => e.text == data.nav2)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : [];
        console.log("##### YAYYYY second step!");
        return {
            to: nav2Id.join(","),
            target: "OperationOnMenu",
        };
    });
    const { html } = secondNav.stop();
    const form = new form_1.default(html);
    return { secondNav, form };
}
exports.navigateToForm = navigateToForm;
async function innerNavigation(data) {
    const $ = (0, cheerio_1.load)(data);
    return $("div.main_ul_links a")
        .map((_, e) => ({
        text: $(e).text(),
        id: (0, utils_1.extractRoleIds)($(e).attr("onclick")),
    }))
        .toArray();
}
async function checkPageTitle(data) {
    const $ = (0, cheerio_1.load)(data);
    const titleText = $("title").text();
    console.log("titleText: " + titleText.trim());
    return titleText.trim() == "EduWave - الخدمة غير متوفرة :: نظام نور";
}
//# sourceMappingURL=navigation.js.map