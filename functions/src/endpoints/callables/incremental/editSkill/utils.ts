import { load as loadHtml } from "cheerio";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import Table from "../../../../core/table";

export type skill = {
  id: string;
  value: string;
  skillId: number;
  title: string; // sometimes is the student
};

export class SkillsForm extends Form {
  constructor(html: string) {
    super(html);
  }

  async save(
    skills: {
      skillId: string;
      value: number;
    }[],
    redirect: Redirect
  ) {
    const skillValues =
      skills
        .reduce(
          (acc, v, i) => [
            ...acc,
            `${i == 0 ? "" : i - 1 + "#"}${v.value},${v.skillId}`,
          ],
          []
        )
        .join(",") + `,${skills.length - 1}#`;

    const payload = this.fetchOptionRequestPayload(
      {
        name: "ctl00$PlaceHolderMain$hdnSkillResultIDs",
        value: skillValues,
      },
      []
    );

    skills.forEach((_, i) => {
      payload[
        `ctl00$PlaceHolderMain$gvInsertSkillByUnitAndSkill$ctl${
          i + 2
        }$tbTeacherNotes`
      ] = "";
    });

    const action = this.getFormAction();

    const start = Date.now();
    redirect
      .fork(
        action,
        {
          ...payload,
          __EVENTTARGET: "",
          ctl00$ibtnYes: "نعم",
          ctl00$hdnData_Data: "",
          ctl00$hdnData_Operation: "Save",
        },
        undefined,
      )
      .then(() => console.log((Date.now() - start) / 1000));
  }

  updateFromSubmission(data: string) {
    this.updateForm(data);

    Form.parseResponse(data, {
      updatePanel: (id, value) => {
        const panel = loadHtml(value);
        // CHECK hardcoded

        const isSkillsKinder = id == "ctl00$PlaceHolderMain$UpdatePanel7";
        const isGridClass = !!panel(".GridClass").length;

        if (isGridClass) {
          const name = panel("table[id]")?.attr("id")?.replace(/_/g, "$");

          const target = panel(".GridClass").parent().html();
          if (target) {
            let table!: Table<skill, undefined>;
            if (isSkillsKinder) table = new KinderSkillsTable(target);
            else table = new PrimarySkillsTable(target);

            const skills = table.lines();
            this.appendSkills(name, skills);
          } else {
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

    return {
      ...data,
      ...this.getSkills(),
    };
  }

  private getSkills() {
    const table = this.$(".skillTable");
    const skillsId = table.attr("id");

    const skills: skill[] = [];

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

  private appendSkills(id: string, skills: skill[]) {
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

  static fromJson(config: {
    action: string;
    weirdData: { [key: string]: string };
    inputs: FormInput[];
    actionButtons: FormInput[];
  }) {
    return new SkillsForm(Form.fromJson(config).html);
  }
}

export class PrimarySkillForm extends SkillsForm {
  async save(
    skills: {
      id: string;
      skillId: string;
      value: number;
    }[],
    redirect: Redirect
  ) {
    const skillValues =
      skills
        .reduce(
          (acc, v, i) => [
            ...acc,
            `${i == 0 ? "" : i - 1 + "#"}${v.value},${v.skillId}`,
          ],
          []
        )
        .join(",") + `,${skills.length - 1}#`;

    const payload = this.fetchOptionRequestPayload(
      {
        name: "ctl00$PlaceHolderMain$hdnPassFlags",
        value: skillValues,
      },
      []
    );

    const perfix = skills[0].id.split("$").slice(0, 3).join("$");
    skills.forEach((skill, i) => {
      payload[skill.id] = `${skill.value},${skill.skillId}`;
      const isEmpty = (skill.value as any as string) === "";

      if (!isEmpty) {
        payload[
          `${perfix}$ctl${(i + 2).toString().padStart(2, "0")}$tbTeacherNotes`
        ] = "";
      }
    });

    const action = this.getFormAction();

    const start = Date.now();
    redirect
      .fork(action, {
        ...payload,
        [`${perfix}$ctl01$ddlCurentPassFlag`]: ",0",
        __EVENTTARGET: "",
        ctl00$ibtnYes: "نعم",
        ctl00$hdnData_Data: "",
        ctl00$hdnData_Operation: "Save",
      })
      .then(() => console.log((Date.now() - start) / 1000));
  }

  static fromJson(config: {
    action: string;
    weirdData: { [key: string]: string };
    inputs: FormInput[];
    actionButtons: FormInput[];
  }) {
    return new PrimarySkillForm(Form.fromJson(config).html);
  }
}

export class KinderSkillsTable extends Table<skill, undefined> {
  protected filter(tr: cheerio.Cheerio): boolean {
    return this.$("img", tr).length != 0;
  }
  protected processLine(tr: cheerio.Cheerio): skill {
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

export class PrimarySkillsTable extends Table<skill, undefined> {
  protected filter(tr: cheerio.Cheerio): boolean {
    return this.$(".StandardFontPlain", tr).length != 0;
  }
  protected processLine(tr: cheerio.Cheerio): skill {
    const select = this.$("select", tr);
    const id = select.attr("name");

    const selected = this.$("option[selected]", select);
    const selectedValues = selected.attr("value").split(",");
    const value = selectedValues[0];
    const skillId = selectedValues[1];

    const title =
      this.$("td:nth-child(3)", tr).text() || this.$("td", tr).first().text();

    return {
      id,
      value,
      title,
      skillId: parseInt(skillId),
    };
  }
}
