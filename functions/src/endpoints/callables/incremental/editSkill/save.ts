import * as functions from "firebase-functions";
import { isBlocked } from "../../../../common";
import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { PrimarySkillForm, SkillsForm } from "./utils";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  skills: {
    id: string;
    skillId: string;
    value: number;
  }[];
}

export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;

    const homePage = await Redirect.load(data);

    const form = await saveSkills(data, homePage);

    console.log("#####################");
    return homePage.sendForm(form);
  });

export async function saveSkills(data: NavigationData, homePage: Redirect) {
  let form: SkillsForm;

  if (data.isPrimary) {
    form = PrimarySkillForm.fromJson({
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [],
      ...homePage.send({}),
    });
  } else {
    form = SkillsForm.fromJson({
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [],
      ...homePage.send({}),
    });
  }

  await form.save(data.skills, homePage.clone());
  // if (response) form.updateFromSubmission(response);

  return form;
}
