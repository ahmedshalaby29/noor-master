"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const form_1 = require("../../../../core/form");
const redirect_1 = require("../../../../core/redirect");
const utils_1 = require("./utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/degreeSave", async (req, res) => {
    try {
        const data = req.body;
        const homePage = await redirect_1.default.load(data);
        const form = new utils_1.DegreesForm(form_1.default.fromJson({
            action: data.action,
            weirdData: data.weirdData,
            inputs: data.inputs,
            actionButtons: [],
        }).html);
        const courseId = data.inputs
            .find((i) => i.name.includes("rMain$ddlCours"))
            .options.find((s) => s.selected).value;
        const period = data.inputs
            .find((i) => i.name.includes("ddlPeriodEnter"))
            .options.find((s) => s.selected).value;
        await form.save(data.degrees, { courseId, period }, homePage);
        res.send(homePage.send({})).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
//# sourceMappingURL=save.js.map