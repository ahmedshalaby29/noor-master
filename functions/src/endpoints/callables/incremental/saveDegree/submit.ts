import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { DegreesForm } from "./utils";
import { Request, Response } from "express";
import * as express from "express";
interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton: FormInput;
  systemMessage: string;
}
const router = express.Router();
router.post("/", async (req: Request, res: Response) => {
  const data: NavigationData = req.body;
  const homePage = await Redirect.load(data);

  data.actionButton = {
    name: "ctl00$PlaceHolderMain$btY21",
    value: "", // CHECK hard coded
    id: "",
    options: [],
    title: "ابحث",
  };

  const form = new DegreesForm(
    Form.fromJson({
      systemMessage: data.systemMessage,
      action: data.action,
      weirdData: data.weirdData,
      inputs: data.inputs,
      actionButtons: [data.actionButton],
    }).html
  );

  const search = await form.submit(data.actionButton.name!, homePage);

  if (search) {
    const response = DegreesForm.updateFromSreachSubmission(search);
    res
      .send(
        homePage.sendForm(response.form, {
          degrees: response.degrees,
        })
      )
      .status(200);
  }
  res.send(homePage.send({})).status(200);
});
// todo gzip the response data;
