import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { PrimarySkillForm, SkillsForm } from "./utils";
import { Request, Response } from "express";
import * as express from "express";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  skills: {
    id: string;
    skillId: string;
    value: number;
  }[];
}

export const router = express.Router();

router.post("/skillSave", async (req: Request, res: Response) => {
  try {
    const data: NavigationData = req.body.data;
    const homePage = await Redirect.load(data);
  
    const form = await saveSkills(data, homePage);
  
    console.log("#####################");
    res.json(homePage.sendForm(form)).status(200);
  } catch (error) {
    console.log(error)

    res.status(500);

  }

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
