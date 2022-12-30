"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryFailedRequests = exports.randomDelay = exports.clone = exports.escapeQuotes = exports.replaceNullValues = exports.mergeCookies = exports.pageNameBase64 = exports.defaultHeader = exports.hiddenInputs = exports.extractRoleIds = exports.mergeNodeTexts = exports.extractRoleId = exports.randomString = void 0;
const Str = require("@supercharge/strings");
const randomString = (size = 16) => {
    return Str.random(size);
};
exports.randomString = randomString;
function extractRoleId(str) {
    const right = str.split("','").pop();
    const [left] = right.split("'");
    return left;
}
exports.extractRoleId = extractRoleId;
function mergeNodeTexts(nodes, root) {
    return nodes
        .map((_, s) => root(s).text())
        .toArray()
        .reduce((acc, e) => `${acc} ${e}`, "");
}
exports.mergeNodeTexts = mergeNodeTexts;
function extractRoleIds(str) {
    const right = str.split("(").pop();
    const [left] = right.split(")");
    return left.split(",").map((e) => e.replace(/'/g, ""));
}
exports.extractRoleIds = extractRoleIds;
function hiddenInputs($) {
    const hiddens = $("input[type='hidden']");
    let params = {};
    hiddens.map((_, e) => {
        const elm = e;
        params[elm.attribs.name] = elm.attribs.value;
    });
    return params;
}
exports.hiddenInputs = hiddenInputs;
function defaultHeader(cookies) {
    return {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
        Cookie: mergeCookies(cookies).join("; "),
    };
}
exports.defaultHeader = defaultHeader;
function pageNameBase64(url) {
    return Buffer.from(url.split("/").pop().split(".")[0]).toString("base64");
}
exports.pageNameBase64 = pageNameBase64;
function mergeCookies(...cookies) {
    const items = cookies
        .filter((e) => e)
        .map((e) => e
        .filter((e) => e)
        .map((c) => c.split(";"))
        .flat()
        .map((e) => e.trim()))
        .flat();
    const ob = items.reduce((acc, v) => (Object.assign(Object.assign({}, acc), { [v.split("=")[0]]: v.split("=")[1] })), {});
    return Object.entries(ob).reduce((acc, v) => {
        if (!v[1])
            return acc;
        return [...acc, `${v[0]}=${v[1]}`];
    }, []);
}
exports.mergeCookies = mergeCookies;
function replaceNullValues(ob, repalce) {
    Object.keys(ob).forEach((k) => (ob[k] =
        ob[k] == null || ob[k] == "null" || ob[k] == "undefined"
            ? repalce
            : ob[k]));
    return ob;
}
exports.replaceNullValues = replaceNullValues;
function escapeQuotes(str) {
    return (str !== null && str !== void 0 ? str : "").replace(/"/g, '\\"').replace(/'/g, "\\'");
}
exports.escapeQuotes = escapeQuotes;
function clone(ob) {
    if (ob)
        return JSON.parse(JSON.stringify(ob));
    return undefined;
}
exports.clone = clone;
function randomDelay(max, min = 0) {
    const rand = Math.floor(Math.random() * max) + min;
    return new Promise((res) => {
        setTimeout(res, rand);
    });
}
exports.randomDelay = randomDelay;
async function retryFailedRequests(fc, max = 3) {
    let result;
    let error;
    for (let i = 0; i < max; i++) {
        try {
            result = await fc();
            return result;
        }
        catch (e) {
            error = e;
            console.log("Trying aging #", i);
            await randomDelay(1000 * i);
        }
    }
    if (result == null) {
        throw new Error(error);
    }
    return result;
}
exports.retryFailedRequests = retryFailedRequests;
//# sourceMappingURL=utils.js.map