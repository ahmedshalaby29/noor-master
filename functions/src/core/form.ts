import { load, load as loadHtml } from "cheerio";
import { mergeNodeTexts } from "../utils";
import Redirect from "./redirect";

export type FormInput = {
  title: string; // label
  value?: string; // in case the input doesn't have an options "serve as a supliment information"
  id: string; // the parent id
  options: {
    selected: boolean;
    text: string;
    value: string;
  }[];
  name?: string; // the input name
};

export default class Form {
  protected root: cheerio.Root;
  protected form: cheerio.Cheerio;

  protected $(selector: string, context?: cheerio.Cheerio) {
    return this.root(selector, context || this.form);
  }

  constructor(html: string) {
    this.root = loadHtml(html);
    this.form = this.root("body > form").first();
  }

  get html() {
    return this.root.html();
  }

  protected getActionButtons = () => {
    const buttons = this.$("input[type='submit']");
    const inputs: FormInput[] = [];

    buttons.each((_, btnElm) => {
      const btn = this.root(btnElm);
      inputs.push({
        id: btn.parentsUntil("div[id]").parent("div").attr("id"),
        name: btn.attr("name"),
        title: btn.attr("value"),
        options: [],
      });
    });

    return inputs;
  };

  private getInputs() {
    const inputs: FormInput[] = [];

    const titleFields = this.$("div.feild_title");

    titleFields.each((_, elm) => {
      const titleElm = this.root(elm);
      const title = mergeNodeTexts(this.$("span", titleElm), this.root);

      const parent = this.root(elm).parent();

      const select = this.$("select", parent);

      const id = select.parent().attr("id")?.replace(/_/g, "$") ?? "";

      const options: {
        selected: boolean;
        text: string;
        value: string;
      }[] = [];

      let value = "";
      if (!select.length) {
        const next = titleElm.next();
        value = mergeNodeTexts(this.$("span", next), this.root);
      } else {
        this.$("option", select).each((_, e) => {
          const selected = !!this.root(e).attr("selected");
          const text = this.root(e).text();
          const value = this.root(e).attr("value");

          options.push({ selected, text, value });
        });
      }

      inputs.push({
        title,
        value,
        id,
        options,
        name: select.attr("name"),
      });
    });

    return inputs;
  }

  protected getFormAction() {
    let action = this.form.attr("action");
    action = action.replace("https://noor.moe.gov.sa/Noor/EduWaveSMS/", "");

    return `https://noor.moe.gov.sa/Noor/EduWaveSMS/${action}`.replace(
      "./",
      ""
    );
  }

  getWeirdData() {
    const hiddens = this.$("input[type='hidden']");
    const hiddensSpecial = this.$("div[type='special']");

    let params = {} as any;
    hiddens.map((_, e) => {
      const elm = this.root(e);
      params[elm.attr("name")] = elm.attr("value");
    });

    hiddensSpecial.map((_, e) => {
      const elm = this.root(e);
      params[elm.attr("name")] = elm.text();
    });

    return params as { [key: string]: any };
  }

  protected fetchOptionRequestPayload(
    config: { id?: string; name: string; value: string },
    settings: { name: string; value: string }[],
    igoneInputs: boolean = false
  ) {
    const params = igoneInputs ? [] : this.getInputs();

    let payload = params.reduce(
      (acc, v) => ({
        ...acc,
        [v.name]: v.options.find((e) => e.selected)?.value ?? "",
      }),
      {}
    );

    const weirdData = this.getWeirdData();

    payload = {
      ...payload,
      ...weirdData,
      __EVENTTARGET: config.name,
      // __ASYNCPOST: true,
      ctl00$tbNameBookMarks: "",
    };

    settings.forEach((s) => (payload[s.name] = s.value));

    payload[config.name] = config.value;

    if (config.id) {
      payload["ctl00oScriptManager"] = `${config.id}|${config.name}`;
    }

    return payload;
  }

  async submit(name: string, redirect: Redirect, config?: {}) {
    const actionButtons = this.getActionButtons();
    const target = actionButtons.find((e) => e.name == name)!;

    const payload = this.fetchOptionRequestPayload(
      { id: target.id, name: target.name!, value: target.title },
      []
    );

    const action = this.getFormAction();

    const data = await redirect.fork(
      action,
      {
        ...payload,
        [target.name!]: target.title,
        __EVENTTARGET: "",
      },
      config
    );

    return data;
  }

  async fetchFromOption(
    config: { id: string; name: string; value: string },
    settings: { name: string; value: string }[],
    redirect: Redirect
  ) {
    const payload = this.fetchOptionRequestPayload(config, settings);
    const action = this.getFormAction();
    const data = await redirect.fork(action, payload);

    this.updateForm(data);
    redirect.setWeiredData(this.getWeirdData());
  }

  /**
   * handle the select and form aciton and basic hidden inputs
   */
  protected updateForm(data: string) {
    Form.parseResponse(data, {
      updatePanel: (id, value) => {
        const wrapper = this.$(".wrapper");
        // check if the value is the whole data "sometimes its not ust a select!"
        const $ = loadHtml(value);
        if ($(".form-controls").length) {
          wrapper.empty();
          wrapper.append(value);
          return;
        }

        // multi parts selection
        if ($("select").length > 1) {
          $("select").each((_, e) => {
            const name = $(e).attr("name");
            const replaceBy = $(e).parent();

            const shouldBeReplaced = this.$(`*[name='${name}']`).first();
            if (shouldBeReplaced.length) {
              shouldBeReplaced.replaceWith(replaceBy);
            } else {
              // todo append before the last element [name]
              wrapper.append(`<div>${replaceBy.parent().html()}</div>`);
              console.log("####should be created");
            }
          });
        }

        // default behavior
        this.$(`*[id='${id}'] > select`).first().replaceWith(value);
      },
      hiddenFeild: (name, value) => {
        this.$(`input[name='${name}']`).attr("value", value);
        this.$(`div[name='${name}']`).html(value);
      },
      formAction: (action) => {
        this.form.attr("action", action);
      },
    });
  }

  static fromJson(config: {
    action: string;
    weirdData: { [key: string]: string };
    inputs: FormInput[];
    actionButtons: FormInput[];
  }) {
    const { action, actionButtons, weirdData, inputs } = config;
    const root = loadHtml("<body></body>");

    root("body").append(`<form action="${action}"></div>`);
    const form = root("form");

    Object.entries(weirdData)
      .map(([k, v]) => `<div type='special' name='${k}'>${v}</div>`)
      .forEach((e) => form.append(e));

    const inputWrapper = load('<div class="wrapper"></div>')(".wrapper");

    inputs.forEach((inp) => inputWrapper.append(this.createField(inp)));

    actionButtons.forEach((inp) =>
      inputWrapper.append(`<div id="${inp.id}"><div>
    <input type="submit" name="${inp.name}" value="${inp.title}" />
    </div></div>`)
    );

    form.append(inputWrapper.parent().html());
    return new this(root.html());
  }

  toJson() {
    const action = this.getFormAction();
    const weirdData = this.getWeirdData();
    const inputs = this.getInputs();
    const actionButtons = this.getActionButtons();

    return {
      action,
      weirdData,
      inputs,
      actionButtons,
    };
  }

  static createField(input: FormInput) {
    const options = input.options
      .map(
        (o) => `
    <option ${o.selected ? "selected" : ""} value="${o.value}">${
          o.text
        }</option>
        >
    `
      )
      .join("");

    return `
    <div>
  <div class="feild_title">
    <span>${input.title}</span>
  </div>
  <div class="feild_data">
    <div id="${input.id}">
    <span>${input.value}</span>
      <select
        name="${input.name}"
      >
      ${options}
        
      </select>
    </div>
  </div>
</div>
`;
  }

  static parseResponse(
    data: string,
    config: {
      updatePanel?: (id: string, value: string) => void;
      hiddenFeild?: (name: string, value: string) => void;
      formAction?: (action: string) => void;
    }
  ) {
    const params = data.split("|").reduce(
      (acc, v) => {
        const last = acc[acc.length - 1];
        if (last.length > 3) {
          acc.push([v]);
        } else {
          last.push(v);
        }
        return acc;
      },
      [[]]
    ) as string[][];

    params.forEach((param) => {
      if (param[1] == "updatePanel") {
        const id = param[2].replace(/_/g, "$"); //CHECK if the first time this is the case!
        const value = param[3];
        if (config.updatePanel) config.updatePanel(id, value);
      } else if (param[1] == "hiddenField") {
        const name = param[2];
        const value = param[3];
        if (config.hiddenFeild) config.hiddenFeild(name, value);
      } else if (param[1] == "formAction") {
        const action = param[3];
        if (config.formAction) config.formAction(action);
      }
    });
  }
}
