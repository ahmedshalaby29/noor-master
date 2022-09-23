import * as functions from "firebase-functions";
import { db, isBlocked, storage } from "../../../../common";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { randomString } from "../../../../utils";
import { DegreesForm } from "../saveDegree/utils";
import { createDegreesPDF, createParmsFromInputs } from "./utils";
import path = require("path");

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton: FormInput;
  isEmpty:boolean,
}

// todo gzip the response data;
export default functions
  .region("asia-south1")
  .runWith({
    memory: "512MB",
  })
  .https.onCall(async (data: NavigationData,context) => {
    if (await isBlocked(context)) return null;

    const homePage = await Redirect.load(data);

    // CHECK i don't need this thing!
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

    const { degrees } = DegreesForm.updateFromSreachSubmission(search);

    const fileName = randomString();
    const pdf = await createDegreesPDF(degrees, fileName, data.inputs,data.isEmpty);



    const config = (filePath: string) => ({
      metadata: {
        metadata: {
          userId: context.auth.uid,
          from: "saveReport/newExamReport",
        },
      },
      destination: `reports/${path.basename(filePath)}`,
    });

    const [onlinePDF] = await storage.upload(pdf, config(pdf));

    const params = createParmsFromInputs(data.inputs);

    await db.collection("reports").add({
      user: context.auth.uid,
      files: {
        pdf: onlinePDF.name,
      },
      params,
      isEmpty: data.isEmpty,
    });

    return homePage.send({});


  });
