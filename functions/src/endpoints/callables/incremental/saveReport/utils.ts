import path = require("path");
import os = require("os");
import * as fs from "fs";
import * as html_to_pdf from "html-pdf-node";
import { FormInput } from "../../../../core/form";
import Table from "../../../../core/table";
import { Degrees } from "../saveDegree/utils";

export type skill = {
  id: string;
  value: string;
  skillId: number;
  title: string;
};

export class SaveReportExamTable extends Table<skill, undefined> {
  protected filter(tr: cheerio.Cheerio): boolean {
    return this.$("img", tr).length != 0;
  }
  protected processLine(tr: cheerio.Cheerio): skill {
    const img = this.$("img", tr);
    const skillId = img.attr("skillid");
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

export function createParmsFromInputs(inputs: FormInput[]) {
  const result = {};

  inputs.forEach((i) => {
    result[i.name!] = i.options.find((e) => e.selected);
  });

  return result;
}

export type Item = { title: string; students: skill[] };

export function createCSV(items: Item[], fileName: string) {
  let csv = "";
  const add = (x: string) => (csv = `${csv},${x.replace(/,/g, " ")}`);

  add("");
  items[0].students.forEach((s) => add(s.title));
  csv += "\n";

  items.forEach((item) => {
    add(item.title);
    item.students.forEach((s) => {
      add(s.value);
    });
    csv += "\n";
  });

  const tempFilePath = path.join(os.tmpdir(), fileName + ".csv");

  fs.writeFileSync(tempFilePath, csv);
  return tempFilePath;
}

export async function createDegreesPDF(
  degrees: Degrees[],
  fileName: string,
  inputs: FormInput[],
  isEmpty = false
) {
  let modules = [
    ...degrees.reduce((acc, i) => {
      i.modules.reduce((a, s) => {
        a.add(s.title);
        return a;
      }, acc);
      return acc;
    }, new Set<string>()),
  ].filter(Boolean);

  const texts: string[][] = [];

  degrees.forEach((degree) => {
    const temp = [degree.studentName];
    degree.modules.forEach((m) =>
      temp.push(isEmpty ? "" : m.input.value.toString())
    );
    texts.push(temp);
  });

  const template = createPDFTemplate({
    head: ["اسم الطالب", ...modules],
    title: " كشف درجات فصل",
    items: texts,
    details: [
      {
        title: "الصف",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlClass"),
      },
      {
        title: "الفصل",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlSection"),
      },
      {
        title: "المادة",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlCourse"),
      },
      {
        title: "الفترة",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlPeriodEnter"),
      },
    ],
  });

  let options = {
    printBackground: true,
    format: "A3",
    margin: {
      top: "20px",
    },
  };

  let file = { content: template };

  const tempFilePath = path.join(os.tmpdir(), fileName + ".pdf");

  await new Promise<void>((res) => {
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      fs.writeFileSync(tempFilePath, pdfBuffer);
      res();
    });
  });

  return tempFilePath;
}

export async function createSKillsPDF(
  items: Item[],
  fileName: string,
  inputs: FormInput[],
  isEmpty = false,
  isPrimary = true
) {
  //  todo use the rating from front end

  const RatingExamples = isPrimary
    ? Ratins[1].map((e) => e.name)
    : oneKindRating(items[0].students[0].value).map((e) => e.name);

  let ratings = [
    ...items.reduce((acc, i) => {
      i.students.reduce((a, s) => {
        const value = isPrimary ? RatingById(Ratins[1], s.value) : s.value;
        a.add(value);
        return a;
      }, acc);
      return acc;
    }, new Set<string>(RatingExamples)),
  ].filter(Boolean);

  console.log(ratings);
  let texts: string[][] = [];
  if (!isEmpty) {
    const students = {};
    items
      .map((e) => e.students)
      .flat()
      .forEach((item) => {
        const toValue = (x: string) =>
          isPrimary ? RatingById(Ratins[1], x) : x;
        if (students[item.title] == undefined) {
          students[item.title] = ratings.reduce((acc, v) => {
            acc[v] = 0;
            return acc;
          }, {});
        }
        students[item.title][toValue(item.value)]++;
      });

    texts = Object.entries(students).map(([k, v]) => [
      k,
      ...Object.values(v),
    ]) as any;
  } else {
    texts = items.map((i) => i.students.map((s) => s.title));
  }

  let details: any = [];
  if (!isPrimary) {
    details = [
      {
        title: "القسم",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlClass"),
      },
      {
        title: "الفصل",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlSection"),
      },
      {
        title: "نوع الوحدة الدراسية",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlUnitTypesDDL"),
      },
      {
        title: "الوحدة الدراسية",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlUnit"),
      },
    ];
  } else {
    details = [
      {
        title: "الصف",
        value: formInputValue(
          inputs,
          "ctl00$PlaceHolderMain$oDistributionUC$ddlClass"
        ),
      },
      {
        title: "الفصل",
        value: formInputValue(
          inputs,
          "ctl00$PlaceHolderMain$oDistributionUC$ddlSection"
        ),
      },
      {
        title: "المادة",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlCourse"),
      },
      {
        title: "الفترة",
        value: formInputValue(inputs, "ctl00$PlaceHolderMain$ddlPeriod"),
      },
    ];
  }

  let head: string[] = [];

  if (!isEmpty) {
    head = ["اسم الطالب", ...ratings];
  } else {
    head = ["اسم الطالب", ...items.map((i) => i.title)];
  }

  const template = createPDFTemplate({
    head,
    title: "كشف المهارات",
    items: texts,
    details,
    isMulti: isEmpty,
  });

  let options = {
    printBackground: true,
    format: "A3",
    margin: {
      top: "20px",
    },
  };

  let file = { content: template };

  const tempFilePath = path.join(os.tmpdir(), fileName + ".pdf");

  await new Promise<void>((res) => {
    html_to_pdf.generatePdf(file, options).then((pdfBuffer) => {
      fs.writeFileSync(tempFilePath, pdfBuffer);
      res();
    });
  });

  return tempFilePath;
}

function createPDFHead(items: { title: string; value: string }[]) {
  return items.reduce((acc, v) => {
    return `${acc}<div>
    <span>${v.title}</span>
    <span>${v.value}</span>
  </div>`;
  }, "");
}

function createPDFTemplate(config: {
  title: string;
  head: string[];
  items: string[][];
  details: { title: string; value: string }[];
  isMulti?: boolean;
}) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.title}</title>
      

    </head>
    <body>
    <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@200;500;900&display=swap" rel="stylesheet">

      <div style=" padding: 5px 3em;font-family: 'Tajawal', sans-serif;">
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
         <div style="width:100px;height:100px;overflow:hidden">
         <img src="https://my.orsodnour.com/assets/logo.d660a6cd.png" style="width:100%;height:100%"/>
         </div>
          <div>
            <div style="display: flex; flex-direction: column; align-items:
            center; justify-content: space-between;"">
            <div style="width: 100px; height: 75px; background-color: transparent"></div>
            <h3>${config.title}</h3>
          </div>
        </div>
        <div style="text-align: right">
        ${createPDFHead(config.details)}
      </div>
      </div>
  
      ${
        config.isMulti
          ? createMultiPDFTables(config.head, config.items)
          : createPDFTable(config.head, config.items)
      }
      </div>  
  </body>
  </html>
  
  
  `;
}

function createPDFTable(head: string[], items: string[][]) {
  return `
  <table style="border: 1px solid black;padding: 0px;  width: 100%; direction: rtl; text-align: right;border-collapse: collapse;">
          
      <thead>


          <tr style=" text-align:center; background-color: rgb(199, 199, 199); margin: -2px;">
${head
  .map(
    (h, i) => `
<th style="padding: 6px 0;${i == 0 ? "text-align:center" : ""}">${h}</th>

`
  )
  .join("")}  

          </tr>
      </thead>
      <tbody>

      ${items
        .map(
          (item) => `
      <tr style="padding-right: 10px; text-align: center; ">

      ${item
        .map(
          (text, i) => `
      
      <td style="padding: 3px 0; ${
        i == 0 ? "padding-right: 3px; text-align: right;" : ""
      } border: 1px solid rgb(108, 108, 108);" >${text}</td>
      `
        )
        .join("")}
      </tr>
      `
        )
        .join("")}

          </tbody>
  </table>`;
}

function createMultiPDFTables(head: string[], items: string[][]) {
  const title = head.shift();

  let html = "";
  const max = 5;
  const names = items[0];
  for (let i = 0; i < head.length; i += max) {
    const slice = head.slice(i, i + max);
    const page = createPDFTable(
      [title, ...slice],
      names.map((i) => [i, ...Array(max).fill("")])
    );
    html += page + '<div style="page-break-before: always;"></div>';
  }

  return html;
}

function formInputValue(inputs: FormInput[], name: string) {
  return (
    inputs.find((i) => i.name == name)?.options.find((o) => o.selected)?.text ??
    ""
  );
}

export const Ratins = [
  [
    {
      name: "أتقن",
      description: "",
      id: "1",
    },
    {
      name: "لم يتقن",
      description: "",
      id: "2",
    },
    {
      name: "إلى حد ما",
      description: "",
      id: "3",
    },
    {
      name: "غير محدد",
      description: "",
      id: "",
    },
  ],
  [
    {
      name: "متقن للمعيار 100%",
      description: "",
      id: "1",
    },
    {
      name: "متقن للمعيار من 90% الى أقل من 100%",
      description: "",
      id: "3",
    },
    {
      name: "متقن للمعيار من 80% الى أقل من 90%",
      description: "",
      id: "4",
    },
    {
      name: "غير متقن للمعيار أقل من 80%",
      description: "",
      id: "0",
    },
    {
      name: "غائب",
      description: "",
      id: "2",
    },
    {
      name: "غير محدد",
      description: "",
      id: "",
    },
  ],
  [
    {
      name: "جيد",
      description: "",
      id: "good",
    },
    {
      name: "سيء",
      description: "",
      id: "bad",
    },
    {
      name: "غير محدد",
      description: "",
      id: "unknown",
    },
    {
      name: "غير محدد",
      description: "",
      id: "somewhat",
    },
  ],
];

const oneKindRating = (name: string) => {
  return Ratins.find((i) => i.some((a) => a.name == name)) ?? Ratins[0];
};

const RatingById = (rates: any[], id: string) => {
  return rates.find((v) => v.id == id).name;
};
