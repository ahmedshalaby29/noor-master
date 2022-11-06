import * as functions from "firebase-functions";
import { FormInput } from "../../core/form";
import Redirect from "../../core/redirect";
//@ts-ignore
import { executeAllPossible, executeVariant } from "../../core/variatForm";
import { IncrementalData } from "../../types";
import { saveSkills } from "../callables/incremental/editSkill/save";
import { fetchSkills } from "../callables/incremental/editSkill/submit";
import { fetchOptions } from "../callables/incremental/formOptions";
const util = require("util");

export interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];

  period?: string;
  rate: number;
}

export default functions
  .region("asia-south1")
  .runWith({
    timeoutSeconds: 60 * 9,
    memory: "1GB",
  })
  .firestore.document("tasks/{taskId}")
  .onCreate(async (snapshot) => {
    const docData = snapshot.data();
    //gets nav data from the document created by the frontend
    const data = docData.payload as NavigationData;
    //checks if the teacher is a primary teacher for some reason
    const { isPrimary } = docData;
    //creates a redirect object with the sent cookies and from and weirdData
    const homePage = Redirect.load(data);

    // CHECK get the skillsIDS and the form variante, you don't have to fetch all skills everytime, but the skills my vary depending on the form paramters!
    console.log("saveAll function started..");
    //gets the action url from the nav data sent by the frontend
    let { action } = data;

    //recursive function
    await executeAllPossible(isPrimary, data, data.inputs, homePage, {
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
          name: data.period ? "ctl00$PlaceHolderMain$ddlPeriod" : "edzedze",
          value: data.period ?? "dsdsdsd",
        },
      ],
    });

    //updates the task refrence in the db when everything is complete
    //and removes the task payload object
    await snapshot.ref.update({ completed: true, payload: {} });

    console.log("############################################");
  });

export async function executeSkillEdits(
  data: NavigationData,
  isPrimary: boolean,
  homePage: Redirect
) {
  const response = await fetchSkills(data, isPrimary, homePage);
  // get all the skills with thier ids
  let { action, skills, inputs } = response.toJson();
  console.log("response");
  console.log(
    util.inspect(response, { showHidden: false, depth: null, colors: true })
  );
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
