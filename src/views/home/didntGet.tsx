import { Transition } from "@headlessui/react";
import { trace } from "firebase/performance";
import React, { useContext, useEffect, useRef, useState } from "react";
import CustomButton from "../../components/home/customButton";
import Noti from "../../components/home/noti";
import SelectBox from "../../components/home/selectBox";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import Page from "../../layout/home/page";
import { NoorSection, NoorSkill, TeacherType } from "../../models/home_model";
import Repository from "../../repository";
import { perf } from "../../main";
import { teacherTypeArabic, wait } from "../../utils";
import SlideTransition from "../../layout/home/slideTransition";
import { createAction } from "../../layout/home/actionBar";
import useIfIffect from "../../hooks/useIfEffect";

interface DidntGetProps {}

const modules = [
  {
    class: "الثالثة ابتدائي",
    module: "علوم",
    num: 4,
    id: "dsds",
  },
  {
    class: "الثالثة ابتدائي",
    module: "علوم",
    num: 4,
    id: "dssqd",
  },
  {
    class: "الثالثة ابتدائي",
    module: "علوم",
    num: 4,
    id: "dssds",
  },
];

enum NotyType {
  empty,
  exists,
}

const DidntGet: React.FC<DidntGetProps> = () => {
  const tracePages = useRef(trace(perf, "didntGet"));

  const { teacherType, currentRole } = useContext(HomeContext);
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

  const { inputs, setForm, submit, isAllChosen, updateInputs, loadingIndex } =
    useFormOptions({
      label: "DidntGet" + teacherType,
      actionName: "ibtnSearch",
      excludedNames: ["ddlStudySystem", "ddlSection"],
      isPrimary: teacherType == TeacherType.primary,
    });

  const [notyType, setNotyType] = useState<NotyType>();

  const [period, setPeriod] = useState("");

  const [stage, setStage] = useState(0);
  const [loading, setLoading] = useState(false);

  useIfIffect(() => {
    setPeriod(
      inputs
        .find((i) => i.name?.includes("ddlPart"))
        ?.options.find((e) => e.selected)?.text ?? ""
    );
  }, [stage == 1]);

  useEffect(() => {
    Repository.instance
      .navigateTo({
        account: currentRole!,
        nav1: NoorSection.skill,
        nav2: NoorSkill.studentDidntGet,
      })
      .then((r) => setForm(r.form))
      .catch(logout);
  }, []);

  const fetchSkills = () =>
    wait(async () => {
      setStage(1);
    }, setLoading);

  const checkSave = async () => {};
  const back = () => setStage(Math.max(stage - 1, 0));

  const actions = [
    createAction({
      enable: isAllChosen,
      buttons: [
        {
          label: "استعراض",
          onClick: fetchSkills,
        },
      ],
    }),
  ];

  return (
    <Page
      title="طلاب لم يتقنوا المهارات"
      size={stage == 1 ? "md" : "sm"}
      actions={actions[stage]}
      loading={loadingIndex == -1 || !inputs.length || loading}
    >
      {notyType == NotyType.empty && <Noti text="لا يوجد" color="red" />}

      <SlideTransition className="flex-1" show={stage == 0}>
        {inputs.map((input, i) => (
          <div key={input.id}>
            <SelectBox
              loading={i > loadingIndex}
              select={(e) => updateInputs(input.name!, e)}
              label={input.title}
              options={input.options.map((e) => ({
                id: e.value,
                name: e.text,
                selected: e.selected,
              }))}
            />
          </div>
        ))}
      </SlideTransition>

      <SlideTransition className={" flex-1"} show={stage == 1}>
        <h3 className="text-indigo-600 bg-indigo-50 py-1 font-arabic text-center text-md">
          طلاب لم يتقنو المهارات في {period}
        </h3>

        <div className="mt-8 w-full flex flex-col overflow-hidden">
          <div className="-my-2 overflow-x-auto ">
            <div className="inline-block w-full py-2 align-middle md:px-6 lg:px-8">
              <table
                style={{ direction: "rtl" }}
                className="min-w-full  text-right divide-y divide-gray-300"
              >
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
                    >
                      الصف
                    </th>
                    <th
                      scope="col"
                      className="py-3.5 px-3 text-right text-sm font-semibold text-gray-900"
                    >
                      المادة
                    </th>

                    <th
                      scope="col"
                      className="hidden md:block py-3.5 px-3 text-right text-sm font-semibold text-gray-900"
                    >
                      العدد
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {modules.map((m) => (
                    <tr key={m.id} className="focus-within:bg-indigo-50">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
                        {m.class}
                      </td>
                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {m.module}
                      </td>

                      <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {m.num}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 md:pr-0">
                        <button
                          onClick={() => setStage(2)}
                          className="text-indigo-600  p-1 hover:text-indigo-900"
                        >
                          تعديل
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </SlideTransition>

      <SlideTransition className="flex-1" show={stage == 2}>
        <h3 className="text-indigo-600 mt-1 bg-indigo-50 py-1 font-arabic text-center text-md">
          طلاب لم يتقنوا المهارات في {period}
        </h3>

        <div className="flex justify-center space-x-6 mt-2 items-center">
          <h3 className="text-center font-arabic text-zinc-600 ">
            الصف الرابعة
          </h3>
          <h3 className="text-center font-arabic text-zinc-600 ">
            الصف الرابعة
          </h3>
        </div>
        <div className="">
          <SelectBox
            label="الطالب"
            options={[{ id: "dsd", name: "dsd", selected: false }]}
            select={() => {}}
          />
          <div className="mt-3 py-2 scroll-smooth overflow-hidden border border-zinc-300 overflow-y-auto shadow rounded   max-h-40 h-full ">
            {Array(10)
              .fill("")
              .map((_, i) => (
                <button
                  key={i}
                  className={`text-right pr-6
                        ${i == 2 ? "bg-indigo-200 " : ""}
                    hover:bg-indigo-50
                    focus:ring-2 ring-offset-1 ring-indigo-400
                    py-2 w-full text-indigo-700 font-arabic outline-none`}
                >
                  مرحبا باعالم
                </button>
              ))}
          </div>
          <div className="my-3">
            <SelectBox
              label="الطالب"
              options={[{ id: "dsd", name: "dsd", selected: false }]}
              select={() => {}}
            />
          </div>
          <div className="text-center">
            <CustomButton onClick={() => {}}>رصد</CustomButton>
          </div>
        </div>
      </SlideTransition>
    </Page>
  );
};

export default DidntGet;
