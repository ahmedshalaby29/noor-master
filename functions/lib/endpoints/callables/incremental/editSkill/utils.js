"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimarySkillsTable = exports.KinderSkillsTable = exports.PrimarySkillForm = exports.SkillsForm = void 0;
const cheerio_1 = require("cheerio");
const form_1 = require("../../../../core/form");
const table_1 = require("../../../../core/table");
class SkillsForm extends form_1.default {
    constructor(html) {
        super(html);
    }
    async save(skills, redirect) {
        const skillValues = skills
            .reduce((acc, v, i) => [
            ...acc,
            `${i == 0 ? "" : i - 1 + "#"}${v.value},${v.skillId}`,
        ], [])
            .join(",") + `,${skills.length - 1}#`;
        const payload = this.fetchOptionRequestPayload({
            name: "ctl00$PlaceHolderMain$hdnSkillResultIDs",
            value: skillValues,
        }, []);
        skills.forEach((_, i) => {
            payload[`ctl00$PlaceHolderMain$gvInsertSkillByUnitAndSkill$ctl${i + 2}$tbTeacherNotes`] = "";
        });
        const action = this.getFormAction();
        const start = Date.now();
        console.log("payload");
        console.log(payload["ctl00$PlaceHolderMain$oDistributionUC$ddlSection"]);
        redirect
            .fork(action, Object.assign(Object.assign({}, payload), { __EVENTTARGET: "", ctl00$ibtnYes: "نعم", ctl00$hdnData_Data: "", ctl00$hdnData_Operation: "Save" }), undefined)
            .then(() => console.log((Date.now() - start) / 1000));
    }
    updateFromSubmission(data) {
        this.updateForm(data);
        form_1.default.parseResponse(data, {
            updatePanel: (id, value) => {
                var _a, _b;
                const panel = (0, cheerio_1.load)(value);
                // CHECK hardcoded
                const isSkillsKinder = id == "ctl00$PlaceHolderMain$UpdatePanel7";
                const isGridClass = !!panel(".GridClass").length;
                if (isGridClass) {
                    const name = (_b = (_a = panel("table[id]")) === null || _a === void 0 ? void 0 : _a.attr("id")) === null || _b === void 0 ? void 0 : _b.replace(/_/g, "$");
                    const target = panel(".GridClass").parent().html();
                    if (target) {
                        let table;
                        if (isSkillsKinder)
                            table = new KinderSkillsTable(target);
                        else
                            table = new PrimarySkillsTable(target);
                        const skills = table.lines();
                        this.appendSkills(name, skills);
                    }
                    else {
                        this.appendSkills(name, []);
                        console.warn("no skills to be appended");
                    }
                }
            },
        });
        return this.getWeirdData();
    }
    toJson() {
        const data = super.toJson();
        return Object.assign(Object.assign({}, data), this.getSkills());
    }
    getSkills() {
        const table = this.$(".skillTable");
        const skillsId = table.attr("id");
        const skills = [];
        this.$(">div", table).each((_, e) => {
            const elm = this.root(e);
            skills.push({
                id: elm.attr("id"),
                skillId: parseInt(this.$("span", elm).text()),
                value: this.$("p", elm).text(),
                title: this.$("h1", elm).text(),
            });
        });
        return {
            skillsId,
            skills,
        };
    }
    appendSkills(id, skills) {
        let elm = this.$(`*[id='${id}']`);
        if (!elm.length) {
            this.form.append(`<table id="${id}" class="skillTable"></table>`);
            elm = this.$(`*[id='${id}']`);
        }
        skills.forEach((skill) => {
            elm.append(`<div id="${skill.id}">
          <h1>${skill.title}</h1>
          <span>${skill.skillId}</span>
          <p>${skill.value}</p>
        </div>`);
        });
    }
    static fromJson(config) {
        return new SkillsForm(form_1.default.fromJson(config).html);
    }
}
exports.SkillsForm = SkillsForm;
class PrimarySkillForm extends SkillsForm {
    async save(skills, redirect) {
        const skillValues = skills
            .reduce((acc, v, i) => [
            ...acc,
            `${i == 0 ? "" : i - 1 + "#"}${v.value},${v.skillId}`,
        ], [])
            .join(",") + `,${skills.length - 1}#`;
        const payload = this.fetchOptionRequestPayload({
            name: "ctl00$PlaceHolderMain$hdnPassFlags",
            value: skillValues,
        }, []);
        const perfix = skills[0].id.split("$").slice(0, 3).join("$");
        skills.forEach((skill, i) => {
            payload[skill.id] = `${skill.value},${skill.skillId}`;
            const isEmpty = skill.value === "";
            if (!isEmpty) {
                payload[`${perfix}$ctl${(i + 2).toString().padStart(2, "0")}$tbTeacherNotes`] = "";
            }
        });
        const action = this.getFormAction();
        console.log("payload");
        console.log(payload["ctl00$PlaceHolderMain$oDistributionUC$ddlSection"]);
        const start = Date.now();
        redirect
            .fork(action, Object.assign(Object.assign({}, payload), { [`${perfix}$ctl01$ddlCurentPassFlag`]: ",0", __EVENTTARGET: "", ctl00$ibtnYes: "نعم", ctl00$hdnData_Data: "", ctl00$hdnData_Operation: "Save" }))
            .then(() => console.log((Date.now() - start) / 1000));
    }
    static fromJson(config) {
        return new PrimarySkillForm(form_1.default.fromJson(config).html);
    }
}
exports.PrimarySkillForm = PrimarySkillForm;
class KinderSkillsTable extends table_1.default {
    filter(tr) {
        return this.$("img", tr).length != 0;
    }
    processLine(tr) {
        const img = this.$("img", tr);
        const skillId = img.attr("skillid") || img.attr("studentprofileid");
        const value = img.attr("title");
        const id = tr.attr("id").replace(/_/g, "$");
        const title = this.$("td", tr).first().text();
        return {
            id,
            value,
            title,
            skillId: parseInt(skillId),
        };
    }
}
exports.KinderSkillsTable = KinderSkillsTable;
class PrimarySkillsTable extends table_1.default {
    filter(tr) {
        return this.$(".StandardFontPlain", tr).length != 0;
    }
    processLine(tr) {
        const select = this.$("select", tr);
        const id = select.attr("name");
        const selected = this.$("option[selected]", select);
        const selectedValues = selected.attr("value").split(",");
        const value = selectedValues[0];
        const skillId = selectedValues[1];
        const title = this.$("td:nth-child(3)", tr).text() || this.$("td", tr).first().text();
        return {
            id,
            value,
            title,
            skillId: parseInt(skillId),
        };
    }
}
exports.PrimarySkillsTable = PrimarySkillsTable;
//# sourceMappingURL=utils.js.map