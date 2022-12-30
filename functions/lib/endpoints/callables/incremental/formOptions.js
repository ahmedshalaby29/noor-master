"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOptions = exports.router = void 0;
const common_1 = require("../../../common");
const form_1 = require("../../../core/form");
const redirect_1 = require("../../../core/redirect");
const express = require("express");
exports.router = express.Router();
exports.router.post("/formOptions", async (req, res) => {
    var _a;
    try {
        const data = req.body.data;
        const user = req.body.user;
        if (await (0, common_1.isBlocked)(user))
            return null;
        console.log("running formOptions...");
        const homePage = await redirect_1.default.load({
            isPrimary: data.isPrimary,
            cookies: data.cookies,
            weirdData: data.weirdData,
            from: (_a = data.from) !== null && _a !== void 0 ? _a : "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
        });
        const form = await fetchOptions(data, homePage);
        // todo include the cookies and redirected;
        res.json(homePage.sendForm(form)).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
async function fetchOptions(data, homePage) {
    const form = form_1.default.fromJson(Object.assign({ systemMessage: data.systemMessage, action: data.action, weirdData: data.weirdData, inputs: data.inputs, actionButtons: data.actionButtons }, homePage.send({})));
    const selected = data.inputs.find((e) => e.name == data.name);
    const selectedValue = selected.options.find((e) => e.selected);
    await form.fetchFromOption({ id: "", name: selected.name, value: selectedValue.value }, [], homePage);
    return form;
}
exports.fetchOptions = fetchOptions;
//# sourceMappingURL=formOptions.js.map