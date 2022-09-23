import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import CheckBoxs from "../../components/home/checkboxs";
import SelectBox from "../../components/home/selectBox";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import useIfIffect from "../../hooks/useIfEffect";
import { createAction } from "../../layout/home/actionBar";
import Page from "../../layout/home/page";
import SlideTransition from "../../layout/home/slideTransition";
import { NoorExam, NoorSection, TeacherType } from "../../models/home_model";
import Repository from "../../repository";
import { FormInput } from "../../types/communication_types";
import { teacherTypeArabic, wait } from "../../utils";


import { trace } from "firebase/performance";
import { perf } from "../../main";

interface SaveDegreeProps {}

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
  ids:string,
  studentID: number;
  // todo add userProfileID
  studentName: string;
  semester: number;
  modules: Module[];
};

function fetch(account: string) {
  return Repository.instance.navigateTo({
    account,
    nav1: NoorSection.exams,
    nav2: NoorExam.enter,
  });
}

const SaveDegree: React.FC<SaveDegreeProps> = () => {
  const tracePages = useRef(trace(perf, "saveDegree"));
  const { currentRole, teacherType } = useContext(HomeContext);
  const { logout } = useContext(AppContext);



  useEffect(() => {
    tracePages.current.start();
    tracePages.current.putAttribute(
      "treacherType",
      teacherTypeArabic(teacherType!)
    );

    tracePages.current.putMetric("stage", 0);
    return () => tracePages.current.stop();
  }, []);


  const {
    inputs,
    setForm,
    submit,
    formAction,
    updateInputs,
    isAllChosen,
    loadingIndex,
  } = useFormOptions({
    actionName: "ibtnSearch",
    isPrimary:teacherType == TeacherType.primary,
  });

  const [stage, setStage] = useState(0);
  useEffect(() => {
    tracePages.current.incrementMetric("stage", stage);
  }, [stage]);

  const [loading, setLoading] = useState(false);

  const [degrees, setDegrees] = useState<Degrees[]>([]);

  useIfIffect(() => {
    fetchDegress();
  }, [stage == 1]);

  async function fetchDegress() {
    const { degrees } = await submit("degreeSubmit", {});

    setDegrees(degrees);
  }

  useEffect(() => {
    wait(async () => {
      await fetch(currentRole!)
        .then((r) => setForm(r.form))
        .catch(logout);
    }, setLoading);
  }, []);

  const savelAll = async () => {
    saveDegrees(
      degrees.map((de) => {
        const modules = de.modules.map((m, i) => {
          const { presence, input } = singleModule![i];
          const selectedId = presence.options.find((e) => e.selected)!;
          m.presence.options = m.presence.options.map((e) => ({
            ...e,
            selected: selectedId.value == e.value,
          }));
          m.input.value = input.value;

          return m;
        });
        return {
          ...de,
          modules,
        };
      })
    );
  };

  const save = () => {
    saveDegrees(degrees);
  };

  const saveDegrees = async (degrees: Degrees[]) => {
    const data = await Repository.instance.saveDegree({
      action: formAction!,
      inputs,
      degrees: degrees,
      isPrimary:teacherType == TeacherType.primary,
    });
  };

  const back = () => setStage(Math.max(stage - 1, 0));
  const next = () => setStage((s) => s + 1);

  const currentDegree = useMemo(
    () => (stage > 1 && degrees.length ? degrees[stage - 2] : null),
    [stage, degrees]
  );

  const setInput = (studentId: number, moduleTitle: string, value: string) => {
    if (!currentDegree) return;

    setDegrees(
      degrees.map((d) => {
        if (d.studentID != studentId) return d;
        return {
          ...d,
          modules: d.modules.map((m) => {
            if (m.title == moduleTitle) {
              m.input.value = Math.min(m.input.max, parseInt(value));
            }
            return m;
          }),
        };
      })
    );
  };

  const setPresense = (studentId: number, moduleTitle: string, id: string) => {
    if (!currentDegree) return;

    setDegrees(
      degrees.map((d) => {
        if (d.studentID != studentId) return d;
        return {
          ...d,
          modules: d.modules.map((m) => {
            if (m.title == moduleTitle) {
              m.presence.options = m.presence.options.map((e) => ({
                ...e,
                selected: e.value == id,
              }));
            }
            return m;
          }),
        };
      })
    );
  };

  const setSignleModuleInput = (moduleTitle: string, value: string) => {
    setSingleModule(
      singleModule?.map((s) => {
        if (s.title == moduleTitle) {
          s.input.value = Math.min(s.input.max, parseInt(value));
        }
        return s;
      })
    );
  };

  const setSignleModulePresense = (moduleTitle: string, id: string) => {
    setSingleModule(
      singleModule?.map((m) => {
        if (m.title == moduleTitle) {
          m.presence.options = m.presence.options.map((e) => ({
            ...e,
            selected: e.value == id,
          }));
        }
        return m;
      })
    );
  };

  const [singleModule, setSingleModule] = useState<Module[]>();

  useIfIffect(() => {
    const { modules } = degrees[0];
    setSingleModule(JSON.parse(JSON.stringify(modules)));
  }, [!!degrees.length]);

  const isLast = stage - 1 >= degrees.length;

  const actions = [
    createAction({
      show: !!inputs.length,
      enable: isAllChosen && loadingIndex != -1,
      buttons: [
        {
          label: "التالي",
          onClick: next,
        },
      ],
    }),
    createAction({
      loading,
      buttons: [
        {
          label: "رجوع",
          secondary: true,
          onClick: back,
        },
        {
          label: "رصد",
          onClick: savelAll,
          progress: true,
          icon: true,
        },
        {
          label: "طالب على حدة",
          onClick: next,
        },
      ],
    }),
    createAction({
      show: stage > 1,
      buttons: [
        {
          label: "رجوع",
          secondary: true,
          onClick: back,
        },
        {
          label: "الطاب التالي",
          onClick: next,
          visible: !isLast,
        },
        {
          label: "رصد",
          onClick: save,
          visible: isLast,
          icon: true,
        },
      ],
    }),
  ];

  return (
    <Page
      title="رصد درجات فصل"
      size={stage > 0 ? "lg" : "sm"}
      loading={loading  || loadingIndex == -1}
      actions={actions[Math.max(Math.min(stage, 2), 0)]}
    >
      <SlideTransition
        className="flex-1 w-full grid md:grid-cols-2  gap-3"
        show={stage == 0}
        isRtl
      >
        {inputs.map((input, i) => (
          <SelectBox
            key={input.id + i}
            loading={i > loadingIndex}
            select={(e) => updateInputs(input.name!, e)}
            label={input.title}
            options={input.options.map((e) => ({
              id: e.value,
              name: e.text,
              selected: e.selected,
            }))}
          />
        ))}
      </SlideTransition>

      <SlideTransition show={stage == 1}>
        {singleModule?.map((m) => (
          <div className="border-b hover:bg-indigo-50/50 items-end border-b-indigo-500/20 py-2 space-y-4 sm:space-y-0  flex-col px-2 space-x-2 flex sm:flex-row-reverse">
            <div className="">
              <p className="text-sm text-right text-indigo-700">{m.title}</p>
              <div className="flex items-center shadow-sm focus-within:border-indigo-500 border rounded-md border-gray-300 pr-2">
                <input
                  onChange={(e) =>
                    setSignleModuleInput(m.title, e.target.value)
                  }
                  max={m.input.max}
                  value={m.input.value}
                  type="number"
                  className=" bg-white -mr-1 flex-1 pr-1 text-right outline-none rounded-md w-20 text-lg text-indigo-900"
                />
                <p className="font-mono w-10 text-right -mb-1 text-md text-slate-500">
                  / {m.input.max}
                </p>
              </div>
            </div>
            <div className="flex-1 h-8 justify-center">
              <CheckBoxs
                className="flex space-x-2"
                onSelect={(id) => setSignleModulePresense(m.title, id)}
                options={m.presence.options
                  .map((e) => ({
                    id: e.value,
                    value: e.text,
                    selected: e.selected,
                  }))
                  .reverse()}
              />
            </div>
          </div>
        ))}
      </SlideTransition>
      {degrees.map((s, i) => (
        <SlideTransition
          key={s.studentID}
          className={"flex-1"}
          show={stage == i + 2}
        >
          <h3 className="text-indigo-500 font-arabic text-center text-sm">
            {s.studentName}
          </h3>

          <div className="mt-2">
            {currentDegree?.modules.map((m) => (
              <div className="border-b hover:bg-indigo-50/50 items-end border-b-indigo-500/20 py-2 space-y-4 sm:space-y-0  flex-col px-2 space-x-2 flex sm:flex-row-reverse">
                <div className="">
                  <p className="text-sm text-right text-indigo-700">
                    {m.title}
                  </p>
                  <div className="flex items-center shadow-sm focus-within:border-indigo-500 border rounded-md border-gray-300 pr-2">
                    <input
                      onChange={(e) =>
                        setInput(s.studentID, m.title, e.target.value)
                      }
                      max={m.input.max}
                      value={m.input.value}
                      type="number"
                      className=" bg-white -mr-1 flex-1 pr-1 text-right outline-none rounded-md w-20 text-lg text-indigo-900"
                    />
                    <p className="font-mono w-10 text-right -mb-1 text-md text-slate-500">
                      / {m.input.max}
                    </p>
                  </div>
                </div>
                <div className="flex-1 h-8 justify-center">
                  <CheckBoxs
                    className="flex space-x-2"
                    onSelect={(id) => setPresense(s.studentID, m.title, id)}
                    options={m.presence.options
                      .map((e) => ({
                        id: e.value,
                        value: e.text,
                        selected: e.selected,
                      }))
                      .reverse()}
                  />
                </div>
              </div>
            ))}
          </div>
        </SlideTransition>
      ))}
    </Page>
  );
};

export default SaveDegree;
