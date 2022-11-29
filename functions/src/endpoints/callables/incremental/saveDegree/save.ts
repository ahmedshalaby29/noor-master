import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { Degrees, DegreesForm } from "./utils";
import { Request, Response } from "express";
import * as express from "express";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  degrees: Degrees[];
}

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const data: NavigationData = req.body;

  const homePage = await Redirect.load(data);

  const form = new DegreesForm(
    Form.fromJson({
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [],
    }).html
  );

  const courseId = data.inputs
    .find((i) => i.name.includes("rMain$ddlCours"))
    .options.find((s) => s.selected).value;

  const period = data.inputs
    .find((i) => i.name.includes("ddlPeriodEnter"))
    .options.find((s) => s.selected).value;

  await form.save(data.degrees, { courseId, period }, homePage);

  res.send(homePage.send({})).status(200);
});
