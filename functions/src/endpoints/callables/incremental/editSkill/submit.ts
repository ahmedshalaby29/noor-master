import * as functions from "firebase-functions";
import { isBlocked } from "../../../../common";
import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { PrimarySkillForm, SkillsForm } from "./utils";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton?: FormInput;
}

export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;

    const homePage = Redirect.load(data);

    const form = await fetchSkills(data, data.isPrimary, homePage);

    return homePage.sendForm(form);
  });

export async function fetchSkills(
  data: NavigationData,
  isPrimary: boolean,
  homePage: Redirect
) {
  let form: SkillsForm;
  if (!isPrimary) {
    form = SkillsForm.fromJson({
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [data.actionButton],
      ...homePage.send({}),
    });
  } else {
    form = PrimarySkillForm.fromJson({
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [data.actionButton],
      ...homePage.send({}),
    });
  }

  const search = await form.submit(data.actionButton.name!, homePage);

  if (search) {
    const weirdData = form.updateFromSubmission(search);
    homePage.setWeiredData(weirdData);
  }
  return form;
}
