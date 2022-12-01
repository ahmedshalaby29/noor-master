import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { PrimarySkillForm, SkillsForm } from "./utils";
import { Request, Response } from "express";

import * as express from "express";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton?: FormInput;
}

export const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const data: NavigationData = req.body;

  const homePage = Redirect.load(data);

  const form = await fetchSkills(data, data.isPrimary, homePage);

  res.json(homePage.sendForm(form)).status(200);
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
