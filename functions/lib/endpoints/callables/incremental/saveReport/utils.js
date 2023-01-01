"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ratins = exports.createSKillsPDF = exports.createDegreesPDF = exports.createCSV = exports.createParmsFromInputs = exports.SaveReportExamTable = void 0;
const path = require("path");
const os = require("os");
const fs = require("fs");
const table_1 = require("../../../../core/table");
const logoImg_1 = require("./logoImg");
const puppeteer = require("puppeteer");
class SaveReportExamTable extends table_1.default {
    filter(tr) {
        return this.$("img", tr).length != 0;
    }
    processLine(tr) {
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
exports.SaveReportExamTable = SaveReportExamTable;
function createParmsFromInputs(inputs) {
    const result = {};
    inputs.forEach((i) => {
        result[i.name] = i.options.find((e) => e.selected);
    });
    return result;
}
exports.createParmsFromInputs = createParmsFromInputs;
function createCSV(items, fileName) {
    let csv = "";
    const add = (x) => (csv = `${csv},${x.replace(/,/g, " ")}`);
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
exports.createCSV = createCSV;
async function createDegreesPDF(degrees, fileName, inputs, isEmpty = false) {
    let modules = [
        ...degrees.reduce((acc, i) => {
            i.modules.reduce((a, s) => {
                a.add(s.title);
                return a;
            }, acc);
            return acc;
        }, new Set()),
    ].filter(Boolean);
    const texts = [];
    degrees.forEach((degree) => {
        const temp = [degree.studentName];
        degree.modules.forEach((m) => temp.push(isEmpty ? "" : m.input.value.toString()));
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
    let file = { content: template };
    const tempFilePath = path.join(os.tmpdir(), fileName + ".pdf");
    let puppeteerOptions = {
        landscape: true,
        path: tempFilePath,
        margin: { top: "20px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A3",
    };
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 20000,
        ignoreHTTPSErrors: true,
        slowMo: 0,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--window-size=1280,720",
        ],
    });
    const page = await browser.newPage();
    try {
        await page.setContent(file.content);
        await page.evaluateHandle("document.fonts.ready");
        await page.pdf(puppeteerOptions);
        await browser.close();
    }
    catch (error) {
        console.log(error);
    }
    return tempFilePath;
}
exports.createDegreesPDF = createDegreesPDF;
async function createSKillsPDF(items, teacherName, fileName, inputs, isEmpty = false, isPrimary = true) {
    //  todo use the rating from front end
    const RatingExamples = isPrimary
        ? exports.Ratins[1].map((e) => e.name)
        : oneKindRating(items[0].students[0].value).map((e) => e.name);
    let ratings = [
        ...items.reduce((acc, i) => {
            i.students.reduce((a, s) => {
                const value = isPrimary ? RatingById(exports.Ratins[1], s.value) : s.value;
                a.add(value);
                return a;
            }, acc);
            return acc;
        }, new Set(RatingExamples)),
    ].filter(Boolean);
    console.log(ratings);
    let texts = [];
    if (!isEmpty) {
        const students = {};
        items
            .map((e) => e.students)
            .flat()
            .forEach((item) => {
            const toValue = (x) => isPrimary ? RatingById(exports.Ratins[1], x) : x;
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
        ]);
    }
    else {
        texts = items.map((i) => i.students.map((s) => s.title));
    }
    let details = [];
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
            {
                title: "اسم المعلم",
                value: teacherName,
            },
            {
                title: "عدد المهارات",
                value: items.length,
            },
        ];
        console.log(details);
    }
    else {
        details = [
            {
                title: "الصف",
                value: formInputValue(inputs, "ctl00$PlaceHolderMain$oDistributionUC$ddlClass"),
            },
            {
                title: "الفصل",
                value: formInputValue(inputs, "ctl00$PlaceHolderMain$oDistributionUC$ddlSection"),
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
    let head = [];
    if (!isEmpty) {
        head = ["اسم الطالب", ...ratings];
    }
    else {
        head = ["اسم الطالب", ...items.map((i) => i.title)];
    }
    const template = createPDFTemplate({
        head,
        title: "كشف المهارات",
        items: texts,
        details,
        isMulti: isEmpty,
    });
    /*
    let options = {
      printBackground: true,
      format: "A3",
      margin: {
        top: "20px",
      },
    };
  */
    let file = { content: template };
    const tempFilePath = path.join(os.tmpdir(), fileName + ".pdf");
    let puppeteerOptions = {
        landscape: true,
        path: tempFilePath,
        margin: { top: "20px", right: "50px", bottom: "100px", left: "50px" },
        printBackground: true,
        format: "A3",
    };
    const browser = await puppeteer.launch({
        headless: true,
        timeout: 20000,
        ignoreHTTPSErrors: true,
        slowMo: 0,
        args: [
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-setuid-sandbox",
            "--no-first-run",
            "--no-sandbox",
            "--no-zygote",
            "--window-size=1280,720",
        ],
    });
    const page = await browser.newPage();
    try {
        await page.setContent(file.content);
        await page.evaluateHandle("document.fonts.ready");
        await page.pdf(puppeteerOptions);
        await browser.close();
    }
    catch (error) {
        console.log(error);
    }
    return tempFilePath;
}
exports.createSKillsPDF = createSKillsPDF;
function createPDFHead(items) {
    return items.reduce((acc, v) => {
        return `${acc}<div>
    <span>${v.title}:</span>
    <span>${v.value}</span>
  </div>`;
    }, "");
}
function createPDFTemplate(config) {
    return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${config.title}</title>
     <link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900;1000&display=swap" rel="stylesheet">
<style>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700;800;900;1000&display=swap');
</style>
    </head>
    <body>

      <div style=" padding: 5px 2em;font-family:'Cairo', Arial,Helvetica; " >
        <div
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
          "
        >
        <div style="flex-grow: 1; flex-basis: 0;">
         <div style=" width:110px;height:110px;overflow:hidden">
        <img
            src="${logoImg_1.default}"
            alt="test"
            style="width:100%;height:100%"
          />
         </div>
         </div>
          <div>
            <div style="display: flex; flex-direction: column; align-items:
            center; justify-content: space-between;"">
            <div style="width: 100px; height: 75px; background-color: transparent"></div>
            <h3>${config.title}</h3>
          </div>
        </div>
        <div  style="font-size:0.8rem; flex-grow: 1;
   flex-basis: 0; text-align: right; font-weight:bold;">
        ${createPDFHead(config.details)}
      </div>
      </div>

      ${config.isMulti
        ? createMultiPDFTables(config.head, config.items)
        : createPDFTable(config.head, config.items)}
        <div  style="font-weight:bold; font-size:1.5rem; text-align:center; padding: 1rem 0rem;">
      <span style="color:blue;">Orsodnour.com</span>
      <span style="color:brown;">تم انشاء الكشف بواسطه</span>

      <span style="color:green;">ارصد نور</span> 
      </div>
      </div>  
    
  </body>
  </html>
  
  
  `;
}
function createPDFTable(head, items) {
    return `
  <table style="border: 1px solid black;  padding: 0px;  width: 100%; table-layout: fixed; direction: rtl; text-align: right;border-collapse: collapse;">
          
      <thead>


          <tr style=" text-align:center; background-color: rgb(199, 199, 199); ">
${head
        .map((h, i) => `
<th style="padding: 0px 0px;
  height:100px;
  min-width:40px; 
  max-width:30px;
  word-wrap:break-word; 
 ${head.length > 6 ? " font-size:0.6rem;" : "font-size:1rem;"}
  ${i == 0
        ? "text-align:center;  min-width:115px;  -webkit-transform: rotate(0deg); width:115px;  font-size:1.1rem; "
        : ""}"> ${h}</th>

`)
        .join("")}  

          </tr>
      </thead>
      <tbody>

      ${items
        .map((item) => `
      <tr style="padding-right: 10px; text-align: center; ">

      ${item
        .map((text, i) => `
      
      <td style="width:30px; height:30px; padding: 3px 0; ${i == 0
        ? "font-size:11px; width:115px; min-width:115px height:50px; font-weight:bold; padding: 1px 3px; text-align: right;"
        : ""} border: 1px solid rgb(108, 108, 108);" >${text}</td>
      `)
        .join("")}
      </tr>
      `)
        .join("")}

          </tbody>
  </table>`;
}
function createMultiPDFTables(head, items) {
    const title = head.shift();
    //const max = 5;
    const names = items[0];
    const html = createPDFTable([title, ...head], names.map((i) => [i, ...Array(head.length).fill("")]));
    // html += page + '<div style="page-break-before: always;"></div>';
    return html;
}
function formInputValue(inputs, name) {
    var _a, _b, _c;
    return ((_c = (_b = (_a = inputs.find((i) => i.name == name)) === null || _a === void 0 ? void 0 : _a.options.find((o) => o.selected)) === null || _b === void 0 ? void 0 : _b.text) !== null && _c !== void 0 ? _c : "");
}
exports.Ratins = [
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
const oneKindRating = (name) => {
    var _a;
    return (_a = exports.Ratins.find((i) => i.some((a) => a.name == name))) !== null && _a !== void 0 ? _a : exports.Ratins[0];
};
const RatingById = (rates, id) => {
    return rates.find((v) => v.id == id).name;
};
//# sourceMappingURL=utils.js.map