"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const common_1 = require("../../../../common");
const form_1 = require("../../../../core/form");
const redirect_1 = require("../../../../core/redirect");
const utils_1 = require("../../../../utils");
const utils_2 = require("../saveDegree/utils");
const utils_3 = require("./utils");
const path = require("path");
const express = require("express");
exports.router = express.Router();
exports.router.post("/", async (req, res) => {
    const data = req.body;
    const user = req.body.user;
    const homePage = await redirect_1.default.load(data);
    // CHECK i don't need this thing!
    data.actionButton = {
        name: "ctl00$PlaceHolderMain$btY21",
        value: "",
        id: "",
        options: [],
        title: "ابحث",
    };
    const form = new utils_2.DegreesForm(form_1.default.fromJson({
        action: data.action,
        weirdData: data.weirdData,
        inputs: data.inputs,
        actionButtons: [data.actionButton],
    }).html);
    const search = await form.submit(data.actionButton.name, homePage);
    const { degrees } = utils_2.DegreesForm.updateFromSreachSubmission(search);
    const fileName = (0, utils_1.randomString)();
    const pdf = await (0, utils_3.createDegreesPDF)(degrees, fileName, data.inputs, data.isEmpty);
    const config = (filePath) => ({
        metadata: {
            metadata: {
                userId: user.uid,
                from: "saveReport/newExamReport",
            },
        },
        destination: `reports/${path.basename(filePath)}`,
    });
    const [onlinePDF] = await common_1.storage.upload(pdf, config(pdf));
    const params = (0, utils_3.createParmsFromInputs)(data.inputs);
    await common_1.db.collection("reports").add({
        user: user.uid,
        files: {
            pdf: onlinePDF.name,
        },
        params,
        isEmpty: data.isEmpty,
    });
    res.json(homePage.send({})).status(200);
});
// todo gzip the response data;
//# sourceMappingURL=exmaReport.js.map