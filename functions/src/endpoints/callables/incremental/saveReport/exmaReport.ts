import { db, storage } from "../../../../common";
import Form, { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { IncrementalData } from "../../../../types";
import { randomString } from "../../../../utils";
import { DegreesForm } from "../saveDegree/utils";
import { createDegreesPDF, createParmsFromInputs } from "./utils";
import path = require("path");
import { Request, Response } from "express";
import * as express from "express";
import { User } from "firebase/auth";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton: FormInput;
  isEmpty: boolean;
}
export const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  const data: NavigationData = req.body;
     const user: User = req.body.user;

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
  const pdf = await createDegreesPDF(
    degrees,
    fileName,
    data.inputs,
    data.isEmpty
  );

  const config = (filePath: string) => ({
    metadata: {
      metadata: {
        userId: user.uid,
        from: "saveReport/newExamReport",
      },
    },
    destination: `reports/${path.basename(filePath)}`,
  });

  const [onlinePDF] = await storage.upload(pdf, config(pdf));

  const params = createParmsFromInputs(data.inputs);

  await db.collection("reports").add({
    user: user.uid,
    files: {
      pdf: onlinePDF.name,
    },
    params,
    isEmpty: data.isEmpty,
  });

  res.json(homePage.send({})).status(200);
});

// todo gzip the response data;
