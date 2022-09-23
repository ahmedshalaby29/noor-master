import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import RadioList from "../../components/home/radioList";
import SelectBox from "../../components/home/selectBox";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import { createAction } from "../../layout/home/actionBar";
import Page from "../../layout/home/page";
import SlideTransition from "../../layout/home/slideTransition";
import {
  BackgroundTaskType,
  NoorSection,
  NoorSkill,
  SaveCustomTask,
  TeacherType,
} from "../../models/home_model";
import rates, { Rating } from "../../models/rating";
import Repository from "../../repository";
import DB from "../../repository/db";
import { teacherTypeArabic, wait } from "../../utils";

import { trace } from "firebase/performance";
import { perf } from "../../main";
import { useNavigate } from "react-router-dom";

interface SaveCustomProps {}

function fetch(account: string, type: TeacherType) {
  const nav2 =
    type == TeacherType.kindergarten
      ? NoorSkill.skillModuleSkill
      : NoorSkill.moduleSkill;

  return Repository.instance.navigateTo({
    account,
    nav1: NoorSection.skill,
    nav2,
  });
}

function pageTitle(type: TeacherType) {
  if (type == TeacherType.kindergarten)
    return `وحدة ومهارة ${teacherTypeArabic(type)}`;
  return `مادة ومهارة ${teacherTypeArabic(type)}`;
}

const SaveCustom: React.FC<SaveCustomProps> = () => {
  const tracePages = useRef(trace(perf, "saveCustom"));

  const { teacherType, currentRole, tasks } = useContext(HomeContext);
  const { logout, user } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    tracePages.current.start();
    tracePages.current.putAttribute(
      "treacherType",
      teacherTypeArabic(teacherType!)
    );

    tracePages.current.putAttribute("stage", "0");
    return () => tracePages.current.stop();
  }, []);

  const {
    inputs,
    isAllChosen,
    setForm,
    letMeHandleIt,
    updateInputs,
    loadingIndex,
  } = useFormOptions({
    excludedNames: ["ddlSkill", "ddlSkills"],
    actionName: teacherType == TeacherType.primary ? "ibtnS10" : "ibtnSearch",
    isPrimary: teacherType == TeacherType.primary,
  });

  useEffect(() => {
    fetch(currentRole!, teacherType!)
      .then((r) => setForm(r.form))
      .catch(logout);
  }, []);

  const [rating, setRating] = useState<Rating>();

  const [loading, setLoading] = useState(false);
  const [secondStage, setSecondStage] = useState(false);

  const isBlocked = useMemo(() => {
    return (
      tasks.length && tasks.some((s) => s.type == BackgroundTaskType.saveCustom)
    );
  }, [tasks]);

  useEffect(() => {
    tracePages.current.putAttribute("stage", secondStage ? "1" : "0");
  }, [secondStage]);
  const next = () => setSecondStage(true);

  const save = () => {
    const task: SaveCustomTask = {
      payload: {
        ...letMeHandleIt(),
        rate: rating,
      } as any,
      completed: false,
      type: BackgroundTaskType.saveCustom,
      user: user!.uid,
      isPrimary: teacherType == TeacherType.primary,
      created: new Date(),
    };

    wait(() => DB.instance.createTask(task), setLoading);
    setSecondStage(false);
  };

  const actions = [
    createAction({
      show: !!inputs.length,
      enable: isAllChosen && loadingIndex != -1,
      buttons: [
        {
          label: "التالي",
          onClick: next,
        },
        {
          label: "رجوع",
          onClick: () => navigate(-1),
        },
      ],
    }),
    createAction({
      show: secondStage,
      enable: loadingIndex != -1 && rating !== undefined,
      loading,
      buttons: [
        {
          label: "رصد",
          onClick: save,
          icon: true,
          progress: true,
        },
        {
          label: "رجوع",
          onClick: () => setSecondStage(false),
        },
      ],
    }),
  ];

  const title = pageTitle(teacherType!);

  return (
    <Page
      title={title}
      size={secondStage ? "sm" : "lg"}
      loading={!inputs.length || loadingIndex == -1 || !!isBlocked}
      actions={actions[secondStage ? 1 : 0]}
    >
      <SlideTransition
        show={!secondStage}
        isRtl
        className="flex-1  w-full grid md:grid-cols-2 h-full gap-3 "
      >
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

      <SlideTransition show={secondStage}>
        <RadioList
          disabled={loading}
          title={title}
          onSelect={(e) => setRating(e as any)}
          items={rates(teacherType!)}
        />
      </SlideTransition>
    </Page>
  );
};

export default SaveCustom;
