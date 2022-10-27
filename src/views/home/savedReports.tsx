import path from "path/posix";
import React, { useContext, useEffect, useState } from "react";
import CheckTable from "../../components/home/checkTable";
import SelectBox from "../../components/home/selectBox";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import Page from "../../layout/home/page";
import { Report, TeacherType } from "../../models/home_model";
import DB from "../../repository/db";
import Storage from "../../repository/storage";
import { FormInput } from "../../types/communication_types";

interface SavedReportsProps {}

function getTableHeader(type: TeacherType) {
  if (type == TeacherType.kindergarten) return ["المستوى", "الوحدة", "النوع"];
  if (type == TeacherType.primary)
    return ["الصف", "الفصل", "الماده", "الفتره", "النوع"];

  return [];
}

type VisibleReports = {
  id: string;
  childs: string[];
};
type Selection = {
  title: string;
  options: FormInput["options"];
  id: string;
};
const SavedReports: React.FC<SavedReportsProps> = () => {
  const { user } = useContext(AppContext);
  const { teacherType } = useContext(HomeContext);

  const [reports, setReports] = useState<Report[]>([]);

  const [visibleReports, setVisibleReports] = useState<VisibleReports[]>([]);
  const [selection, setSelection] = useState<Selection[]>([]);

  const [selected, onSelected] = useState<string[]>([]);

  const tableHead = getTableHeader(teacherType!);
  const navIds = [
    "ctl00$PlaceHolderMain$oDistributionUC$ddlClass",
    "ctl00$PlaceHolderMain$oDistributionUC$ddlSection",
    "ctl00$PlaceHolderMain$ddlClass",
    "ctl00$PlaceHolderMain$ddlCourse",

    "ctl00$PlaceHolderMain$ddlPeriod",
    "ctl00$PlaceHolderMain$ddlUnit",
  ];
  useEffect(() => createSelectionBoxes(), [reports]);
  function createSelectionBoxes() {
    const navs = [] as FormInput["options"][];

    reports.flat().forEach(({ params }) => {
      Object.entries(params).forEach(([k, v]) => {
        navIds.forEach((id, i) => {
          if (k.includes(id)) {
            navs[i] = [...(navs[i] ?? []), v];
          }
        });
      });
    });
    console.log("reports");
    console.log(reports);
    console.log("navs");
    console.log(navs);

    const all = {
      value: "",
      text: "الكل",
      selected: true,
    };
    setSelection(
      navs.map((n, i) => ({
        id: navIds[i],
        title: tableHead[i],
        options: [{ ...all }, ...n.filter((e) => e.value != "-99")],
      }))
    );
  }

  useEffect(() => createVisibleReports(), [selection]);
  function createVisibleReports() {
    console.log("selection");
    console.log(selection);

    const visible = reports.filter(({ params }) => {
      return selection.every((s) => {
        const active = s.options.find((e) => e.selected)!;
        return Object.entries(params).some(([k, v]) => {
          return (
            k.includes(s.id) && (active.value === "" || active.value == v.value)
          );
        });
      });
    });
    const visibleReports = visible.map(({ id, params, isEmpty }) => {
      const childs = Object.entries(params)
        .filter(([k]) => {
          return selection.some((s) => k.includes(s.id));
        })
        .filter(([_, v]) => v.text != "الكل")
        .sort((a, b) => {
          if (navIds.indexOf(a[0]) > navIds.indexOf(b[0])) return 1;
          else if (navIds.indexOf(a[0]) < navIds.indexOf(b[0])) return -1;
          else return 0;
        })
        .map(([_, v]) => v.text);
      console.log("childs");

      console.log(childs);
      return { id, childs: [...childs, isEmpty ? "فارغ" : "مرصود"] };
    });

    console.log("visibleReports");
    console.log(visibleReports);

    setVisibleReports(visibleReports);
  }

  const select = (navId: string, value: string) => {
    setSelection(
      selection.map((s) => {
        if (s.id == navId) {
          return {
            ...s,
            options: s.options.map((e) => ({
              ...e,
              selected: e.value == value,
            })),
          };
        }
        return s;
      })
    );
  };

  useEffect(() => {
    DB.instance.getReports(user!.uid).then(setReports);
  }, []);

  function remove() {
    let filteredReports = reports;
    selected.forEach((id) => {
      DB.instance.deleteReport(id);
      filteredReports = filteredReports.filter((a) => a.id != id);
      setReports(filteredReports);
    });
  }

  async function download(id?: string) {
    const ids = id ? [id] : selected;
    const paths = reports
      .filter((i) => ids.includes(i.id))
      .map((e) => e.files.pdf);

    try {
      paths.forEach((path) =>
        Storage.instance.getDownloadURL(path).then((url) => {
          console.log(url);
          window.open(url);
        })
      );
    } catch (e) {
      console.log(e);
      console.error("unable to get the urls");
    }
  }

  const actions = {
    buttons: [
      {
        label: "حذف",
        onClick: () => remove(),
        secondary: true,
      },
      {
        label: "تحميل",
        onClick: () => download(),
        progress: true,
      },
    ],
  };

  return (
    <Page title="التقارير المحفوظة" size="lg" actions={actions}>
      <div className="mx-auto max-w-sm w-full">
        {selection.map((input, i) => (
          <div key={i}>
            <SelectBox
              loading={false}
              select={(e) => select(input.id, e)}
              label={input.title}
              options={input.options.map((e) => ({
                id: e.value,
                name: e.text,
                selected: e.selected,
              }))}
            />
          </div>
        ))}
      </div>

      <CheckTable
        head={tableHead}
        action="تحميل"
        onAction={download}
        onSelecte={onSelected}
        items={visibleReports}
      />
    </Page>
  );
};

export default SavedReports;
