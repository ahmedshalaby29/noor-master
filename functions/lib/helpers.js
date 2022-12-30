"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkValidity = exports.extractHomeData = void 0;
const cheerio_1 = require("cheerio");
const utils_1 = require("./utils");
async function extractHomeData(data) {
    try {
        const $ = (0, cheerio_1.load)(data);
        const userName = $(".username").text();
        const allAccounts = $("div.userinfo ul.menu.TopUsers a")
            .map((_, e) => ({
            text: $(e).text(),
            id: (0, utils_1.extractRoleId)($(e).attr("onclick")),
        }))
            .toArray();
        const currentAccount = $("div.userinfo div.hidden_user_info span").text();
        const weirdData = (0, utils_1.hiddenInputs)($);
        const navigation = await mainNavigation(data);
        return {
            userName,
            allAccounts,
            currentAccount,
            weirdData,
            navigation,
        };
    }
    catch (e) {
        console.error(e);
        throw Error("unable to extract the user imformation ");
    }
}
exports.extractHomeData = extractHomeData;
//return
async function mainNavigation(data) {
    const $ = (0, cheerio_1.load)(data);
    const menu = $("#tab-1 ul.menu");
    console.log("title: " + $("title").text());
    const result = $("a", menu)
        .map((_, e) => ({
        text: $(e).text(),
        id: (0, utils_1.extractRoleId)($(e).attr("onclick")),
    }))
        .toArray();
    return result;
}
function checkValidity(data) {
    const $ = (0, cheerio_1.load)(data);
    const span = $("span.ValidationClass");
    if (span.length &&
        span.text().includes("لا يوجد لديك صلاحيات لإدخال المهارات")) {
        return false;
    }
    return true;
}
exports.checkValidity = checkValidity;
//# sourceMappingURL=helpers.js.map