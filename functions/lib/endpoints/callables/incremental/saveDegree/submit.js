"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const form_1 = require("../../../../core/form");
const redirect_1 = require("../../../../core/redirect");
const utils_1 = require("./utils");
const express = require("express");
exports.router = express.Router();
exports.router.post("/degreeSubmit", async (req, res) => {
    try {
        const data = req.body.data;
        console.log(JSON.stringify(data));
        const homePage = await redirect_1.default.load(data);
        data.actionButton = {
            name: "ctl00$PlaceHolderMain$btY21",
            value: "",
            id: "",
            options: [],
            title: "ابحث",
        };
        const form = new utils_1.DegreesForm(form_1.default.fromJson({
            systemMessage: data.systemMessage,
            action: data.action,
            weirdData: data.weirdData,
            inputs: data.inputs,
            actionButtons: [data.actionButton],
        }).html);
        const search = await form.submit(data.actionButton.name, homePage);
        if (search) {
            const response = utils_1.DegreesForm.updateFromSreachSubmission(search);
            res
                .send(homePage.sendForm(response.form, {
                degrees: response.degrees,
            }))
                .status(200);
        }
        res.send(homePage.send({})).status(200);
    }
    catch (error) {
        console.log(error);
        res.status(500);
    }
});
// todo gzip the response data;
//# sourceMappingURL=submit.js.map