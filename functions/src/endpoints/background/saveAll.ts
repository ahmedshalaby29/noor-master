import * as functions from "firebase-functions";
import { FormInput } from "../../core/form";
import Redirect from "../../core/redirect";
import { executeVariant } from "../../core/variatForm";
import { IncrementalData } from "../../types";
import { saveSkills } from "../callables/incremental/editSkill/save";
import { fetchSkills } from "../callables/incremental/editSkill/submit";
import { fetchOptions } from "../callables/incremental/formOptions";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];

  period?: string;
  rate: number;
}

export default functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60 * 9,
    memory: "512MB",
  })
  .firestore.document("tasks/{taskId}")
  .onCreate(async (snapshot) => {
    const docData = snapshot.data();
    const data = docData.payload as NavigationData;
    const { isPrimary } = docData;

    const homePage = Redirect.load(data);

    // CHECK get the skillsIDS and the form variante, you don't have to fetch all skills everytime, but the skills my vary depending on the form paramters!

    let { action } = data;

    await executeVariant(data.inputs, homePage, {
      execute: async (inputs, redirect) => {
        const { cookies, redirected, weirdData } = redirect.send({});

        const config = {
          ...data,
          inputs,
          action,
          cookies,
          from: redirected,
          weirdData,
          isPrimary,
        };
        const response = await executeSkillEdits(config, isPrimary, redirect);

        action = response.action; // CHECK this is might be the cause of paralism not working
        redirect.setWeiredData(response.weirdData);
      },

      fetchOptions: async (inputs, name, redirect) => {
        const { cookies, redirected, weirdData } = redirect.send({});
        const response = await fetchOptions(
          {
            inputs,
            action,
            actionButtons: [],
            name,
            cookies,
            from: redirected,
            weirdData,
            isPrimary: isPrimary,
          },
          redirect
        );

        return response.toJson().inputs.filter((e) => e.options.length);
      },
      customSelect: [
        {
          name: "ctl00$PlaceHolderMain$ddlStudySystem",
          value: "منتظم",
        },
        {
          name: data.period
            ? "ctl00$PlaceHolderMain$ddlPeriod"
            : "edzedze",
          value: data.period ?? "dsdsdsd",
        },
      ],
    });

    await snapshot.ref.update({ completed: true, payload: {} });

    console.log("############################################");
  });

async function executeSkillEdits(
  data: NavigationData,
  isPrimary: boolean,
  homePage: Redirect
) {
  const response = await fetchSkills(data, isPrimary, homePage);
  // get all the skills with thier ids
  let { action, skills, inputs } = response.toJson();
  // submit
  let editedSkill = skills.map((s) => ({
    id: s.id,
    skillId: s.skillId.toString(),
    value: data.rate,
  }));

  const savedResponse = await saveSkills(
    {
      ...data,
      inputs,
      action,
      isPrimary,
      skills: editedSkill,
    },
    homePage
  );

  return savedResponse.toJson();
}
