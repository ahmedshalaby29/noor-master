import * as functions from "firebase-functions";
import { isBlocked } from "../../../../common";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { Degrees, DegreesForm } from "./utils";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  degrees: Degrees[];
}

export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;

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

    return homePage.send({});
  });
