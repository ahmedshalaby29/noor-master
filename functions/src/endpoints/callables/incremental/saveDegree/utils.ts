import { load as loadHtml } from "cheerio";
import * as FormData from "form-data";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import Table from "../../../../core/table";

export class DegreesForm extends Form {
  constructor(html: string) {
    super(html);
  }

  async submit(name: string, redirect: Redirect) {
    const formData = new FormData();
    const actionButtons = this.getActionButtons();
    const target = actionButtons.find((e) => e.name == name)!;

    const payload = this.fetchOptionRequestPayload(
      { id: target.id, name: target.name!, value: target.title },
      []
    );

    const action = this.getFormAction();

    const data = {
      ...payload,
      [target.name!]: target.title,
      __EVENTTARGET: "",
    };

    Object.entries(data).forEach((v) => formData.append(v[0], v[1]));

    formData.append(
      "ctl00$PlaceHolderMain$oFileUploadAttachment",
      Buffer.alloc(1),
      {
        filename: "",
        contentType: "application/octet-stream",
      }
    );

    const response = await redirect.fork(
      action,
      formData,

      formData.getHeaders()
    );

    return response;
  }

  async save(
    degrees: Degrees[],
    details: {
      courseId: string;
      period: string;
    },
    redirect: Redirect
  ) {
    // ctl00$PlaceHolderMain$ddlCoursesToSearch

    const profileIds = degrees
      .map((d) => {
        let id = "";
        d.modules.forEach(() => (id += `${d.studentID},`));
        return id;
      })
      .join("");

    const absents =
      degrees
        .map((e) => e.modules)
        .flat()
        .reduce(
          (acc, v) =>
            `${acc},${v.presence.options.find((e) => e.selected).value}`,
          ""
        )
        .slice(1) + ",";

    const grads =
      degrees
        .map((e) => e.modules)
        .flat()
        .reduce((acc, v) => `${acc},${v.input.value || ""}`, "")
        .slice(1) + ",";

    const exams = degrees.map((e) => e.ids).join("");

    const degreeGrid = {};

    degrees.forEach((degree) => {
      degree.modules.forEach((module) => {
        degreeGrid[module.input.name] = module.input.value;
        degreeGrid[module.presence.name] = module.presence.options.find(
          (s) => s.selected
        ).value;
      });
    });

    const action = this.getFormAction();

    let payload = this.fetchOptionRequestPayload(
      {
        name: "ctl00$PlaceHolderMain$ohdnGradesIDz",
        value: grads,
      },
      [],
      true
    );

    payload = {
      ...payload,
      ...degreeGrid,
      ctl00$PlaceHolderMain$ohdnExamsIDz: exams,
      ctl00$PlaceHolderMain$ohdnUserPlofilesIDz: profileIds,
      ctl00$PlaceHolderMain$ohdnAbsentsIDz: absents,
      __EVENTTARGET: "",
      ctl00$PlaceHolderMain$ibtnSave: "حفظ",
      ctl00$PlaceHolderMain$ddlCoursesToSearch: details.courseId,
      ctl00$PlaceHolderMain$cbHeader: "on",
      ctl00$PlaceHolderMain$ddlPeriodEnterSearch: details.period,
      ctl00$hdnData_Data: "",
    };

    const formData = new FormData();

    Object.entries(payload).forEach((v) => formData.append(v[0], v[1]));

    formData.append(
      "ctl00$PlaceHolderMain$oFileUploadAttachment",
      Buffer.alloc(1),
      {
        filename: "",
        contentType: "application/octet-stream",
      }
    );

    redirect.fork(
      action,
      formData,

      formData.getHeaders()
    );
  }

  static updateFromSreachSubmission(data: string) {
    const panel = loadHtml(data);
    const target = panel(".GridClass").parent().html();

    const form = new Form(data);
    const table = new DegreesTable(target);

    return {
      form,
      degrees: table.lines(),
    };
  }
}

export type Module = {
  presence: FormInput;
  title: string;
  input: {
    max: number;
    value: number;
    name: string;
    id: string;
  };
};

export type Degrees = {
  ids: string;
  studentID: number;
  // todo add userProfileID
  studentName: string;
  semester: number;
  modules: Module[];
};

export class DegreesTable extends Table<Degrees, Module[]> {
  protected filter(tr: cheerio.Cheerio): boolean {
    return true;
  }

  protected processLine(tr: cheerio.Cheerio, first: Module[]): Degrees {
    const modules = Array.from(first);

    const degree: Degrees = {
      modules: [],
    } as any;

    const items = this.$("td", tr);

    items.each((i, e) => {
      const elm = this.root(e);
      if (i == 0) {
        let id =
          elm.attr("studentprofileid") ||
          elm.attr("userprofileid") ||
          elm.text() ||
          "";
        id = id.replace(/,.*/g, "");

        degree.ids = elm.attr("examid");
        degree.studentID = parseInt(id) ?? 0;
      } else if (i == 1) {
        degree.studentName = elm.text();
      } else if (i == 2) {
        degree.semester = parseInt(elm.text());
      } else {
        const select = this.$("select", elm);
        const input = this.$("input", elm);
        const currentModule = modules[degree.modules.length];
        if (select.length) {
          const options: {
            selected: boolean;
            text: string;
            value: string;
          }[] = [];

          this.$("option", select).each((_, e) => {
            const selected = !!this.root(e).attr("selected");
            const text = this.root(e).text();
            const value = this.root(e).attr("value");

            options.push({ selected, text, value });
          });
          const id = select.attr("id");
          const name = select.attr("name");

          degree.modules.push({
            ...currentModule,
            presence: {
              id,
              name,
              options,
              title: "",
            },
          });
        } else if (input.length) {
          const id = input.attr("id");
          const name = input.attr("name");
          const max = input.attr("maxnumber");
          const value = input.attr("value");
          currentModule.input = {
            ...currentModule.input,
            id,
            max: parseInt(max) || 0,
            value: parseFloat(value) || 0,
            name,
          };
        }
      }
    });

    return degree;
  }

  protected processFirstLine(tr: cheerio.Cheerio) {
    const modules: Module[] = [];

    const items = this.$("th", tr);
    items.each((i, e) => {
      if (i < 3 || i + 1 == items.length) return;
      if (i % 2 == 0) return;

      const elm = this.root(e);
      const text = elm.text();
      const [title, max] = text.split("/");

      modules.push({
        input: {
          max: parseInt(max),
          id: "",
          value: 0,
          name: "",
        },
        presence: {
          title: "",
          name: "",
          value: "",
          id: "",
          options: [],
        },
        title,
      });
    });

    return modules;
  }
}
