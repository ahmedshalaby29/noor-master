"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const redirect_1 = require("../../core/redirect");
//@ts-ignore
const variatForm_1 = require("../../core/variatForm");
const save_1 = require("../callables/incremental/editSkill/save");
const submit_1 = require("../callables/incremental/editSkill/submit");
const formOptions_1 = require("../callables/incremental/formOptions");
const express = require("express");
const common_1 = require("../../common");
exports.router = express.Router();
exports.router.post("/saveAll", async (req, res) => {
    var _a, _b;
    try {
        const taskID = req.body.data;
        console.log('saveAll taskID: ');
        console.log(JSON.stringify(taskID));
        const doc = await common_1.db.collection('tasks').doc(taskID).get();
        const docData = doc.data();
        //gets nav data from the document created by the frontend
        const data = docData.payload;
        //checks if the teacher is a primary teacher for some reason
        const { isPrimary } = docData;
        //creates a redirect object with the sent cookies and from and weirdData
        const homePage = redirect_1.default.load(data);
        // CHECK get the skillsIDS and the form variante, you don't have to fetch all skills everytime, but the skills my vary depending on the form paramters!
        console.log("saveAll function started..");
        //gets the action url from the nav data sent by the frontend
        let { action } = data;
        if (docData.type === 'saveCustom') {
            res.status(200).end();
            await (0, variatForm_1.executeVariant)(data.inputs, homePage, {
                execute: async (inputs, redirect) => {
                    const { cookies, redirected, weirdData } = redirect.send({});
                    const config = Object.assign(Object.assign({}, data), { inputs,
                        action,
                        cookies, from: redirected, weirdData,
                        isPrimary });
                    const response = await executeSkillEdits(config, isPrimary, redirect);
                    action = response.action; // CHECK this is might be the cause of paralism not working
                    redirect.setWeiredData(response.weirdData);
                },
                fetchOptions: async (inputs, name, redirect) => {
                    const { cookies, redirected, weirdData } = redirect.send({});
                    const response = await (0, formOptions_1.fetchOptions)({
                        inputs,
                        action,
                        actionButtons: [],
                        name,
                        cookies,
                        from: redirected,
                        weirdData,
                        isPrimary: isPrimary,
                    }, redirect);
                    return response.toJson().inputs.filter((e) => e.options.length);
                },
                customSelect: [
                    {
                        name: "ctl00$PlaceHolderMain$ddlStudySystem",
                        value: "منتظم",
                    },
                    {
                        name: data.period
                            ? "ctl00$PlaceHolderMain$ddlPeriod"
                            : "edzedze",
                        value: (_a = data.period) !== null && _a !== void 0 ? _a : "dsdsdsd",
                    },
                ],
            });
        }
        else {
            res.status(200).end();
            //recursive function
            await (0, variatForm_1.executeAllPossible)(data.inputs, homePage, {
                execute: async (inputs, redirect) => {
                    const { cookies, redirected, weirdData } = redirect.send({});
                    const config = Object.assign(Object.assign({}, data), { inputs,
                        action,
                        cookies, from: redirected, weirdData,
                        isPrimary });
                    const response = await executeSkillEdits(config, isPrimary, redirect);
                    action = response.action; // CHECK this is might be the cause of paralism not working
                    redirect.setWeiredData(response.weirdData);
                },
                fetchOptions: async (inputs, name, redirect) => {
                    const { cookies, redirected, weirdData } = redirect.send({});
                    const response = await (0, formOptions_1.fetchOptions)({
                        inputs,
                        action,
                        actionButtons: [],
                        name,
                        cookies,
                        from: redirected,
                        weirdData,
                        isPrimary: isPrimary,
                    }, redirect);
                    return response.toJson().inputs.filter((e) => e.options.length);
                },
                customSelect: [
                    {
                        name: "ctl00$PlaceHolderMain$ddlStudySystem",
                        value: "منتظم",
                    },
                    {
                        name: data.period ? "ctl00$PlaceHolderMain$ddlPeriod" : "edzedze",
                        value: (_b = data.period) !== null && _b !== void 0 ? _b : "dsdsdsd",
                    },
                ],
            });
            //updates the task refrence in the db when everything is complete
            //and removes the task payload object
        }
        await doc.ref.update({ completed: true, payload: {} });
        console.log("############################################");
    }
    catch (error) {
        console.log(error);
    }
});
async function executeSkillEdits(data, isPrimary, homePage) {
    const response = await (0, submit_1.fetchSkills)(data, isPrimary, homePage);
    // get all the skills with thier ids
    let { action, skills, inputs } = response.toJson();
    console.log('skills ');
    console.log(skills);
    // submit
    let editedSkill = skills.map((s) => ({
        id: s.id,
        skillId: s.skillId.toString(),
        value: data.rate,
    }));
    const savedResponse = await (0, save_1.saveSkills)(Object.assign(Object.assign({}, data), { inputs,
        action,
        isPrimary, skills: editedSkill }), homePage);
    return savedResponse.toJson();
}
//# sourceMappingURL=saveAll.js.map