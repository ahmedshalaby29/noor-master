import { db, isBlocked, storage } from "../../../../common";
import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { executeVariant } from "../../../../core/variatForm";
import { IncrementalData } from "../../../../types";
import { randomString } from "../../../../utils";
import { fetchSkills } from "../editSkill/submit";
import { fetchOptions } from "../formOptions";
import { createParmsFromInputs, createSKillsPDF, Item } from "./utils";
import { Request, Response } from "express";
import * as express from "express";

import path = require("path");
import { User } from "firebase-auth";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];
  actionButton?: FormInput;
  isEmpty: boolean;
}
export const router = express.Router();

router.post("/newSkillReport", async (req: Request, res: Response) => {
  try {
    const data: NavigationData = req.body.data;
    const user: User = req.body.user;

    if (await isBlocked(user)) return null;

    const homePage = await Redirect.load(data);

    let { action } = data;

    let items: Item[] = [];

    await executeVariant(data.inputs, homePage, {
      execute: async (inputs, redirect) => {
        const { cookies, redirected, weirdData } = redirect.send({});

        const title = inputs[inputs.length - 1].options.find(
          (e) => e.selected
        )!.text;

        const config = {
          ...data,
          inputs,
          action,
          cookies,
          from: redirected,
          weirdData,
        };

        const response = await fetchSkills(config, data.isPrimary, homePage);
        // get all the skills with thier ids
        action = response.toJson().action;

        items.push({
          title,
          students: response.toJson().skills,
        });

        redirect.setWeiredData(response.getWeirdData());
      },
      fetchOptions: async (inputs, name) => {
        const response = await fetchOptions(
          {
            ...data,
            inputs,
            ...homePage.send({}),
            action,
            actionButtons: [],
            name,
          },
          homePage
        );
        // submit the form
        return response.toJson().inputs;
      },
      customSelect: [
        {
          name: "ctl00$PlaceHolderMain$ddlUnitTypesDDL",
          value: "الكل",
        },
        {
          name: "ctl00$PlaceHolderMain$ddlStudySystem",
          value: "منتظم",
        },
      ],
    });

    items = items.map((e) => ({
      ...e,
      students: e.students.map((s) => ({
        ...s,
        value: data.isEmpty ? "" : s.value,
      })),
    }));

    const fileName = randomString();

    const userData = (await db.collection("users").doc(user.uid).get()).data();

    console.log("Userdata: " + userData);
    const pdf = await createSKillsPDF(
      items,
      userData.name,

      fileName,
      data.inputs,
      data.isEmpty,
      data.isPrimary
    );
    data.inputs.forEach((i) => console.log(i.options));
    console.log(data.isEmpty);
    console.log(data.isPrimary);

    const config = (filePath: string) => ({
      metadata: {
        metadata: {
          userId: user.uid,
          from: "saveReport/newSkillReport",
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
      date: new Date().toJSON(),
    });
    res.json(homePage.send({})).status(200);
  } catch (error) {
    console.log(error);
    res.status(500);
  }
});
