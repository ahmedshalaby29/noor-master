import React, { useContext, useEffect, useRef, useState } from "react";
import RadioList from "../../components/home/radioList";
import SelectBox from "../../components/home/selectBox";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";
import useFormOptions from "../../hooks/useFormOptions";
import useIfIffect from "../../hooks/useIfEffect";
import ActionButtons, { createAction } from "../../layout/home/actionBar";
import Page from "../../layout/home/page";
import SlideTransition from "../../layout/home/slideTransition";
import { NoorSection, NoorSkill, TeacherType } from "../../models/home_model";
import rates, {
  KinderRating,
  PrimaryRating,
  RateById,
  RateByName,
} from "../../models/rating";
import Repository from "../../repository";
import { teacherTypeArabic, wait } from "../../utils";

import { trace } from "firebase/performance";
import { perf } from "../../main";
import PageTitle from "../../components/home/pageTitle";
import Card from "../../components/home/card";

interface EditSkillProps {}

export type Skill = {
  id: string;
  value: string;
  skillId: number;
  title: string;
};

function pageTitle(type: TeacherType) {
  return type == TeacherType.kindergarten
    ? "تعديل مهارات الطفل"
    : `تعديل مهارات طالب`;
}

function fetch(account: string, type: TeacherType) {
  const nav2 =
    type == TeacherType.kindergarten
      ? NoorSkill.skillModuleChild
      : NoorSkill.moduleStudent;

  return Repository.instance.navigateTo({
    account: account,
    nav1: NoorSection.skill,
    nav2,
  });
}

const EditSkill: React.FC<EditSkillProps> = () => {
  const tracePages = useRef(trace(perf, "EditSkill"));
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

  const ratingSystem =
    teacherType == TeacherType.kindergarten ? KinderRating : PrimaryRating;

  const {
    inputs,
    setForm,
    formAction,
    submit,
    updateInputs,
    loadingIndex,
    isAllChosen,
  } = useFormOptions({
    actionName: teacherType == TeacherType.primary ? "Rtb44" : "ibtnSearch",
    isPrimary: teacherType == TeacherType.primary,
  });

  useEffect(() => {
    fetch(currentRole!, teacherType!)
      .then((r) => setForm(r.form))
      .catch(logout);
  }, []);

  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    tracePages.current.incrementMetric("pageIndex", 1);
  }, [stage]);

  const [allOneSkill, setAllOneSkill] = useState(ratingSystem[0]);

  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    setSkills((s) =>
      s.map((a) => ({
        ...a,
        value: allOneSkill.name,
      }))
    );
  }, [allOneSkill]);

  function setSkillsById(skillId: number, ratingId: number) {
    setSkills((skills) =>
      skills.map((e) => {
        if (e.skillId == skillId) {
          return {
            ...e,
            value: ratingSystem.find((i) => i.id == ratingId)!.name,
          };
        } else return e;
      })
    );
  }

  useIfIffect(() => {
    const name = inputs
      .find((i) => i.id.includes("PanelStudent"))
      ?.options.find((e) => e.selected)?.text;

    fetchSkills();
  }, [stage == 1]);

  function fetchSkills() {
    wait(async () => {
      const skillValue = teacherType == TeacherType.primary ? "id" : "name";

      const response = await submit("skillSubmit", {});

      setSkills(
        response.skills.map((e) => ({
          ...e,
          value: RateByName(ratingSystem, e.value)[skillValue] as string,
        }))
      );
    }, setLoading);
  }

  const saveCustom = () =>
    wait(async () => {
      const editedSkills = skills.map((s) => ({
        ...s,
        value: RateByName(ratingSystem, s.value).id,
      }));

      const data = await Repository.instance.editSkillSave({
        action: formAction!,
        inputs,
        skills: editedSkills,
        isPrimary: teacherType == TeacherType.primary,
      });

      setForm((prevForm) => ({
        ...data.form,
        actionButtons: prevForm?.actionButtons ?? [],
      }));
      setStage(0);
    }, setLoading);


  const title = pageTitle(teacherType!);

  const actions = createAction({
    enable: isAllChosen,
    show: stage == 0 && !!inputs.length,
    buttons: [
      {
        label: "بحث",
        onClick: () => setStage(1),
      },
    ],
  });

  const saveAction = createAction({
    enable: isAllChosen,
    show: !!skills.length,
    buttons: [
      {
        label: "رصد التقيم",
        onClick: saveCustom,
      },
    ],
  });

  return (
    <div className="flex flex-1 h-full flex-col">
      <PageTitle title={title!} />

      <div
        className={`mt-4 h-full flex flex-col max-w-lg mx-auto w-full overflow-hidden rounded-md
      `}
      >
        <Card loading={!inputs.length || loading || loadingIndex == -1}>
          <div
            className=" grid grid-cols-2 gap-2 gap-y-2"
            style={{ direction: "rtl" }}
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
          </div>
          <ActionButtons {...actions} />

          {!!skills.length && (
            <>
              <div className="border-t-2 border-gray-200 mt-2 py-2 my-2">
                <SelectBox
                  select={(e) => {
                    setAllOneSkill(ratingSystem.find((i) => i.id == e)!);
                  }}
                  options={rates(teacherType!).map((r) => ({
                    description: "dsd",
                    id: r.id.toString(),
                    name: r.name,
                    selected: allOneSkill.name == r.name,
                  }))}
                  label="تقيم كل المهارات"
                />
              </div>

              <div className="border-t-2 border-gray-200 mt-2 py-2 space-y-2">
                {skills.map((s) => (
                  <SelectBox
                    label={s.title}
                    select={(e: any) => setSkillsById(s.skillId, e as any)}
                    options={rates(teacherType!).map((r) => ({
                      description: "dsd",
                      id: r.id.toString(),
                      name: r.name,
                      selected: r.name == s.value,
                    }))}
                  />
                ))}
              </div>
              <ActionButtons {...saveAction} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default EditSkill;
