import * as functions from "firebase-functions";
import { isBlocked } from "../../../../common";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { DegreesForm } from "./utils";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton: FormInput;
}

// todo gzip the response data;
export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;

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
        action: data.action,
        weirdData: data.weirdData,
        inputs: data.inputs,
        actionButtons: [data.actionButton],
      }).html
    );

    const search = await form.submit(data.actionButton.name!, homePage);

    if (search) {
      const response = DegreesForm.updateFromSreachSubmission(search);
      return homePage.sendForm(response.form, {
        degrees: response.degrees,
      });
    }

    return homePage.send({});
  });
