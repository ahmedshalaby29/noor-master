"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const common_1 = require("../../../../common");
const redirect_1 = require("../../../../core/redirect");
const variatForm_1 = require("../../../../core/variatForm");
const utils_1 = require("../../../../utils");
const submit_1 = require("../editSkill/submit");
const formOptions_1 = require("../formOptions");
const utils_2 = require("./utils");
const express = require("express");
const path = require("path");
exports.router = express.Router();
exports.router.post("/newSkillReport", async (req, res) => {
    try {
        const data = req.body.data;
        const user = req.body.user;
        if (await (0, common_1.isBlocked)(user))
            return null;
        const homePage = await redirect_1.default.load(data);
        let { action } = data;
        let items = [];
        await (0, variatForm_1.executeVariant)(data.inputs, homePage, {
            execute: async (inputs, redirect) => {
                const { cookies, redirected, weirdData } = redirect.send({});
                const title = inputs[inputs.length - 1].options.find((e) => e.selected).text;
                const config = Object.assign(Object.assign({}, data), { inputs,
                    action,
                    cookies, from: redirected, weirdData });
                const response = await (0, submit_1.fetchSkills)(config, data.isPrimary, homePage);
                // get all the skills with thier ids
                action = response.toJson().action;
                items.push({
                    title,
                    students: response.toJson().skills,
                });
                redirect.setWeiredData(response.getWeirdData());
            },
            fetchOptions: async (inputs, name) => {
                const response = await (0, formOptions_1.fetchOptions)(Object.assign(Object.assign(Object.assign(Object.assign({}, data), { inputs }), homePage.send({})), { action, actionButtons: [], name }), homePage);
                // submit the form
                return response.toJson().inputs;
            },
            customSelect: [
                {
                    name: "ctl00$PlaceHolderMain$ddlUnitTypesDDL",
                    value: "الكل",
                },
                {
                    name: "ctl00$PlaceHolderMain$ddlStudySystem",
                    value: "منتظم",
                },
            ],
        });
        items = items.map((e) => (Object.assign(Object.assign({}, e), { students: e.students.map((s) => (Object.assign(Object.assign({}, s), { value: data.isEmpty ? "" : s.value }))) })));
        const fileName = (0, utils_1.randomString)();
        const userData = (await common_1.db.collection("users").doc(user.uid).get()).data();
        console.log("Userdata: " + userData);
        const pdf = await (0, utils_2.createSKillsPDF)(items, userData.name, fileName, data.inputs, data.isEmpty, data.isPrimary);
        data.inputs.forEach((i) => console.log(i.options));
        console.log(data.isEmpty);
        console.log(data.isPrimary);
        const config = (filePath) => ({
            metadata: {
                metadata: {
                    userId: user.uid,
                    from: "saveReport/newSkillReport",
                },
            },
            destination: `reports/${path.basename(filePath)}`,
        });
        const [onlinePDF] = await common_1.storage.upload(pdf, config(pdf));
        const params = (0, utils_2.createParmsFromInputs)(data.inputs);
        await common_1.db.collection("reports").add({
            user: user.uid,
            files: {
                pdf: onlinePDF.name,
            },
            params,
            isEmpty: data.isEmpty,
            date: new Date().toJSON(),
        });
        res.json(homePage.send({})).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
//# sourceMappingURL=skillReport.js.map