import { FormInput } from "../../../../core/form";
import { createSKillsPDF, Item } from "./utils";

async function writePDF() {
  let items: Item[] = [];
  items.push(
    {
      title:
        "المهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارة المهارةالمهارةالمهارةاره",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةاره",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهاالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةره",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهاالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةره",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهاالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةره",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةه",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    },
    {
      title:
        "المهارهالمهارةالمهارةالمهارةالمهارةالمهارةالمهارةال   مهارةال  مهارةالمهارةالمهارةالمهارةالمهارة",
      students: [
        { id: "2", value: "testValue", skillId: 2, title: "testTitle" },
      ],
    }
  );
  let inputs: FormInput[] = [
    {
      title: "نظام الدراسة",
      value: "",
      id: "ctl00$PlaceHolderMain$UpdatePanel4",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlStudySystem",
    },
    {
      title: "القسم",
      value: "",
      id: "ctl00$PlaceHolderMain$UpdatePanel2",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlClass",
    },
    {
      title: "الفصل",
      value: "",
      id: "ctl00$PlaceHolderMain$UpdatePanel12",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlSection",
    },
    {
      title: "نوع الوحدة الدراسية",
      value: "",
      id: "ctl00$PlaceHolderMain$oUpdatePanelUnitType",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlUnitTypesDDL",
    },
    {
      title: "الوحدة الدراسية",
      value: "",
      id: "ctl00$PlaceHolderMain$UpdatePanel3",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlUnit",
    },
    {
      title: "المهارة",
      value: "",
      id: "ctl00$PlaceHolderMain$oUpdatePanelSkill",
      options: [
        { selected: false, text: "اختر", value: "-99" },
        { selected: true, text: "مستوى ثالث", value: "23" },
      ],
      name: "ctl00$PlaceHolderMain$ddlSkill",
    },
  ];

  await createSKillsPDF(items, "test teacher name" ,"testPDF",inputs, true, false);
}

 writePDF();

