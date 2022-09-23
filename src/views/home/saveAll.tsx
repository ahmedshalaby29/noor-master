import { trace } from "firebase/performance";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import RadioList from "../../components/home/radioList";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import { createAction } from "../../layout/home/actionBar";
import Page from "../../layout/home/page";
import { perf } from "../../main";
import {
  BackgroundTaskType,
  NoorSection,
  NoorSkill,
  SaveAllTask,
  TeacherType,
} from "../../models/home_model";
import rates, { Rating } from "../../models/rating";
import Repository from "../../repository";
import DB from "../../repository/db";
import { teacherTypeArabic, wait } from "../../utils";

interface SaveAllProps {}

function fetch(account: string) {
  return Repository.instance.navigateTo({
    account,
    nav1: NoorSection.skill,
    nav2: NoorSkill.skillModuleSkill,
  });
}

function pageTitle(type: TeacherType) {
  return `رصد الكل ب${teacherTypeArabic(type!)}`;
}

const SaveAll: React.FC<SaveAllProps> = () => {
  const tracePages = useRef(trace(perf, "saveAll"));

  const navigate = useNavigate();
  const { teacherType, currentRole } = useContext(HomeContext);
  const { logout, user } = useContext(AppContext);
  const [selected, select] = useState<Rating>();
  const [loading, setLoading] = useState(false);

  const { setForm, letMeHandleIt,inputs } = useFormOptions({
    actionName: "ibtnSearch",
    isPrimary: teacherType == TeacherType.primary,
  });

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
      .catch(logout);
  }, []);

  const save = async () => {
    const task: SaveAllTask = {
      payload: {
        ...letMeHandleIt(),
        rate: selected,
      } as any,
      completed: false,
      type: BackgroundTaskType.saveAll,
      user: user!.uid,
      isPrimary: teacherType == TeacherType.primary,
      created: new Date(),
    };

    wait(() => DB.instance.createTask(task), setLoading);
  };

  const title = pageTitle(teacherType!);

  const actions = createAction({
    loading: loading,
    enable: selected !== undefined,
    buttons: [
      {
        label: "رصد",
        onClick: save,
        progress: true,
        icon: true,
      },
      {
        label: "رجوع",
        onClick: () => navigate(-1),
      },
    ],
  });

  return (
    <Page title={title} actions={actions} loading={loading}>
      <RadioList
        disabled={loading}
        title={title}
        onSelect={(e) => select(e as any)}
        items={rates(teacherType!)}
      />
    </Page>
  );
};

export default SaveAll;
