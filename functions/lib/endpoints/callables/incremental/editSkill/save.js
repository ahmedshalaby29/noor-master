"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveSkills = exports.router = void 0;
const redirect_1 = require("../../../../core/redirect");
const utils_1 = require("./utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/skillSave", async (req, res) => {
    try {
        const data = req.body.data;
        const homePage = await redirect_1.default.load(data);
        const form = await saveSkills(data, homePage);
        console.log("#####################");
        res.json(homePage.sendForm(form)).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
async function saveSkills(data, homePage) {
    let form;
    if (data.isPrimary) {
        form = utils_1.PrimarySkillForm.fromJson(Object.assign({ action: data.action, weirdData: data.weirdData, inputs: data.inputs, actionButtons: [] }, homePage.send({})));
    }
    else {
        form = utils_1.SkillsForm.fromJson(Object.assign({ action: data.action, weirdData: data.weirdData, inputs: data.inputs, actionButtons: [] }, homePage.send({})));
    }
    await form.save(data.skills, homePage.clone());
    // if (response) form.updateFromSubmission(response);
    return form;
}
exports.saveSkills = saveSkills;
//# sourceMappingURL=save.js.map