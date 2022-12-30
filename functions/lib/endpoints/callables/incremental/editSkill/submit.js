"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSkills = exports.router = void 0;
const redirect_1 = require("../../../../core/redirect");
const utils_1 = require("./utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/skillSubmit", async (req, res) => {
    try {
        const data = req.body.data;
        console.log(JSON.stringify(data));
        const homePage = redirect_1.default.load(data);
        const form = await fetchSkills(data, data.isPrimary, homePage);
        res.json(homePage.sendForm(form)).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
async function fetchSkills(data, isPrimary, homePage) {
    let form;
    if (!isPrimary) {
        form = utils_1.SkillsForm.fromJson(Object.assign({ action: data.action, weirdData: data.weirdData, inputs: data.inputs, actionButtons: [data.actionButton] }, homePage.send({})));
    }
    else {
        form = utils_1.PrimarySkillForm.fromJson(Object.assign({ action: data.action, weirdData: data.weirdData, inputs: data.inputs, actionButtons: [data.actionButton] }, homePage.send({})));
    }
    const search = await form.submit(data.actionButton.name, homePage);
    if (search) {
        const weirdData = form.updateFromSubmission(search);
        homePage.setWeiredData(weirdData);
    }
    return form;
}
exports.fetchSkills = fetchSkills;
//# sourceMappingURL=submit.js.map