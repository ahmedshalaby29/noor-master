import { trace } from "firebase/performance";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import RadioList from "../../components/home/radioList";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import { createAction } from "../../layout/home/actionBar";
import Page from "../../layout/home/page";
import SlideTransition from "../../layout/home/slideTransition";
import { perf } from "../../main";
import {
  BackgroundTaskType,
  NoorSection,
  NoorSkill,
  SavePeriodTask,
  TeacherType,
} from "../../models/home_model";
import rates, { Rating } from "../../models/rating";
import Repository from "../../repository";
import DB from "../../repository/db";
import { FormInput } from "../../types/communication_types";
import { teacherTypeArabic, wait } from "../../utils";

interface SavePeriodProps {}

function fetch(account: string) {
  return Repository.instance.navigateTo({
    account,
    nav1: NoorSection.skill,
    nav2: NoorSkill.moduleSkill,
  });
}

function pageTitle(type: TeacherType) {
  return `رصد الكل ب${teacherTypeArabic(type!)}`;
}

const SavePeriod: React.FC<SavePeriodProps> = () => {
  const tracePages = useRef(trace(perf, "savePeriod"));

  const { teacherType, currentRole } = useContext(HomeContext);
  const { logout, user } = useContext(AppContext);
  const [selected, select] = useState<Rating>();
  const [loading, setLoading] = useState(false);
  const [secondStage, setSecondStage] = useState(false);

  const { setForm, inputs, letMeHandleIt } = useFormOptions({
    actionName: "ibtnS10",
    isPrimary: teacherType == TeacherType.primary,
  });

  const [period, setPeriod] = useState<string>();

  const periods = useMemo(() => {
    return inputs
      .find((i) => i.name?.includes("ddlPeriod"))
      ?.options.filter((e) => e.value != "-99");
  }, [inputs]);

  useEffect(() => {
    tracePages.current.start();
    tracePages.current.putAttribute(
      "treacherType",
      teacherTypeArabic(teacherType!)
    );

    tracePages.current.putMetric("stage", 0);
    return () => tracePages.current.stop();
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(currentRole!)
      .then((r) => {
        setForm(r.form);
        setLoading(false);
      })
      .catch(() => {
        console.log("Logged Out because of failed current role fetch request");
        logout();
      });
  }, []);

  const save = async () => {
    const task: SavePeriodTask = {
      payload: {
        ...letMeHandleIt(),

        rate: selected,
        period,
      } as any,
      completed: false,
      type: BackgroundTaskType.savePeriod,
      user: user!.uid,
      isPrimary: teacherType == TeacherType.primary,
      created: new Date(),
    };
    console.log(`periods: ${task}`);

    wait(() => DB.instance.createTask(task), setLoading);
  };

  const next = () => {
    setSecondStage(true);
  };

  const title = pageTitle(teacherType!);

  const actions = createAction({
    loading: loading,
    enable:
      (selected !== undefined && secondStage) || (!secondStage && !!period),
    buttons: [
      {
        label: "التالي",
        onClick: next,
        visible: !secondStage,
      },
      {
        label: "رصد",
        onClick: save,
        progress: true,
        icon: true,
        visible: secondStage,
      },
    ],
  });

  console.log(`periods: ${periods}`);
  return (
    <Page title={title} actions={actions} loading={!inputs.length}>
      <SlideTransition show={!secondStage}>
        {periods && (
          <RadioList
            disabled={loading}
            title={title}
            onSelect={(e) => setPeriod(e.toString())}
            items={periods!.map((p) => ({
              id: p.text,
              name: p.text,
              description: "",
            }))}
          />
        )}
      </SlideTransition>

      <SlideTransition show={secondStage}>
        <RadioList
          disabled={loading}
          title={title}
          onSelect={(e) => select(e as any)}
          items={rates(teacherType!)}
        />
      </SlideTransition>
    </Page>
  );
};

export default SavePeriod;
