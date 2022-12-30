"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const cheerio_1 = require("cheerio");
const FormData = require("form-data");
const querystring_1 = require("querystring");
//import fs = require("fs");
const utils_1 = require("../utils");
const axios_retry_1 = require("axios-retry");
(0, axios_retry_1.default)(axios_1.default);
const failedRequests_1 = require("../endpoints/background/failedRequests");
class Redirect {
    constructor(config) {
        console.log("new Instance ~~~~~~~~~~~~~~~~~~~~~~~~~~éé");
        this.from = config.from;
        this.cookies = config.cookies;
        this.target = config.target;
        this.to = config.to;
        this.weirdData = config.weirdData;
        this.html = config.html;
        this.redirected = config.redirected;
        this.prevCookies = config.prevCookies;
        this.id = Math.floor(Math.random() * 1000);
    }
    create(config) {
        const instance = new Redirect(Object.assign(Object.assign({}, this), config));
        return instance;
    }
    clone() {
        return new Redirect({
            cookies: this.cookies,
            from: this.from,
            target: this.target,
            to: this.to,
            weirdData: {},
            html: this.html,
            redirected: this.redirected,
            prevCookies: this.prevCookies,
        });
    }
    static async start(config) {
        var _a;
        const from = (_a = config.from) !== null && _a !== void 0 ? _a : "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx";
        const { data, headers } = await axios_1.default.get(from, {
            headers: (0, utils_1.defaultHeader)(config.cookies),
        });
        return new Redirect({
            cookies: config.cookies,
            from,
            target: "",
            to: "",
            weirdData: {},
            html: data,
            redirected: "",
            prevCookies: headers["set-cookie"],
        });
    }
    static load(config) {
        var _a;
        return new Redirect({
            cookies: config.cookies,
            from: (_a = config.from) !== null && _a !== void 0 ? _a : "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
            target: "",
            to: "",
            weirdData: config.weirdData,
            html: "",
            redirected: "",
            prevCookies: [],
        });
    }
    async nextIf(condition, treat) {
        const response = {
            html: this.html,
            redirected: this.redirected,
            weirdData: this.weirdData,
            prevCookies: this.prevCookies,
        };
        if (await condition(response)) {
            return this.next(treat);
        }
        return this;
    }
    //sets up instance params for the do method to make the request
    async next(treat) {
        const navigation = await treat({
            html: this.html,
            redirected: this.redirected,
            weirdData: this.weirdData,
            prevCookies: this.prevCookies,
        });
        this.to = navigation.to;
        this.target = navigation.target;
        this.from = this.redirected || this.from;
        this.weirdData = navigation.weirdData || this.weirdData;
        return await this.do();
    }
    stop() {
        return {
            redirected: this.redirected,
            weirdData: this.weirdData,
            html: this.html,
            prevCookies: this.prevCookies,
        };
    }
    async fork(to, payload, config = {
        "X-MicrosoftAjax": "Delta=true",
        "X-Requested-With": "XMLHttpRequest",
        ADRUM: "isAjax:true",
    }, timeout = 30000) {
        const cookies = (0, utils_1.mergeCookies)(this.prevCookies, this.cookies);
        const isSaveAndForget = payload["ctl00$ibtnYes"] != undefined;
        if (!(payload instanceof FormData)) {
            payload = (0, utils_1.replaceNullValues)(payload, "");
            payload = (0, querystring_1.stringify)(payload);
        }
        try {
            const { data, headers } = await (0, utils_1.retryFailedRequests)(() => axios_1.default.post(to, payload, {
                headers: Object.assign(Object.assign(Object.assign({}, (0, utils_1.defaultHeader)(cookies)), { Referer: this.from, "Content-Type": "application/x-www-form-urlencoded" }), config),
                timeout: Math.abs(timeout),
            }), isSaveAndForget ? 1 : 3);
            this.weirdData = (0, utils_1.hiddenInputs)((0, cheerio_1.load)(data));
            this.prevCookies = (0, utils_1.mergeCookies)(this.cookies, this.prevCookies, headers["set-cookie"]);
            return data;
        }
        catch (e) {
            const failedRequest = {
                to,
                payload,
                headers: Object.assign(Object.assign(Object.assign({}, (0, utils_1.defaultHeader)(cookies)), { Referer: this.from, "Content-Type": "application/x-www-form-urlencoded" }), config),
            };
            (0, failedRequests_1.excuteFailedRequest)(failedRequest);
        }
    }
    async do() {
        var _a;
        const { cookies, from, to, weirdData, target } = this;
        const requestData = Object.assign(Object.assign({}, weirdData), { ctl00$hdnData_Data: "", ctl00$hdnData_Operation: "", ctl00$hdnPageName: (0, utils_1.pageNameBase64)(from), ctl00$hdnStopInterval: "True", ctl00$hdPageIDBookMarks: "", ctl00$hdPageControlsBookMarks: "", ctl00$hdFolderIDBookMarks: "", __EVENTARGUMENT: to || "", __EVENTTARGET: target !== null && target !== void 0 ? target : weirdData.__EVENTTARGET });
        (0, utils_1.replaceNullValues)(requestData, "");
        /*
         const myConsole = new console.Console(
         fs.createWriteStream("./output.txt"));
          myConsole.log("from : " + from);
           myConsole.log("requestData : " + JSON.stringify(requestData));
           myConsole.log("headers : " + JSON.stringify({
            ...defaultHeader(cookies),
            Referer: from,
            "Content-Type": "application/x-www-form-urlencoded",
          }));
    
          console.log("The file was saved!");
        */
        var { data: responseData, headers, request, } = await axios_1.default.post(from, (0, querystring_1.stringify)(requestData), {
            headers: Object.assign(Object.assign({}, (0, utils_1.defaultHeader)(cookies)), { Referer: from, "Content-Type": "application/x-www-form-urlencoded" }),
        });
        /*
        const htmlConsole = new console.Console(
          fs.createWriteStream("./htmlOutput.txt")
        );
        htmlConsole.log("responseData : " + responseData);
       */
        return this.create({
            html: responseData,
            weirdData: (0, utils_1.hiddenInputs)((0, cheerio_1.load)(responseData)),
            redirected: request.res.responseUrl,
            prevCookies: (_a = headers["set-cookie"]) !== null && _a !== void 0 ? _a : [],
        });
    }
    setWeiredData(weirdData) {
        this.weirdData = weirdData;
    }
    send(ob) {
        return {
            redirected: this.redirected,
            cookies: (0, utils_1.mergeCookies)(this.prevCookies, this.cookies),
            from: this.from,
            weirdData: this.weirdData,
            payload: ob,
        };
    }
    sendForm(form, ob) {
        return {
            redirected: this.redirected,
            cookies: (0, utils_1.mergeCookies)(this.prevCookies, this.cookies),
            from: this.from,
            weirdData: form.getWeirdData(),
            payload: Object.assign(Object.assign({ form: form.toJson() }, form.toJson()), (ob !== null && ob !== void 0 ? ob : {})),
        };
    }
}
exports.default = Redirect;
//# sourceMappingURL=redirect.js.map