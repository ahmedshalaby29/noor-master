import { FormInput } from "../../core/form";
import Redirect from "../../core/redirect";
//@ts-ignore
import { executeAllPossible, executeVariant } from "../../core/variatForm";
import { IncrementalData } from "../../types";
import { saveSkills } from "../callables/incremental/editSkill/save";
import { fetchSkills } from "../callables/incremental/editSkill/submit";
import { fetchOptions } from "../callables/incremental/formOptions";
import * as express from 'express'
import { Request, Response } from "express";
import { db } from "../../common";

interface NavigationData extends IncrementalData {
  action: string;
  inputs: FormInput[];

  period?: string;
  rate: number;
}
export const router = express.Router();

router.post("/saveAll", async (req: Request, res: Response) => {
  try {
    const taskID = req.body.data;
   console.log('saveAll taskID: ');
   console.log(JSON.stringify(taskID))

  const doc = await db.collection('tasks').doc(taskID).get()
  const docData = doc.data();

  //gets nav data from the document created by the frontend


  const data = docData.payload as NavigationData;


  //checks if the teacher is a primary teacher for some reason
  const { isPrimary } = docData;


  //creates a redirect object with the sent cookies and from and weirdData
  const homePage = Redirect.load(data);
  
   // CHECK get the skillsIDS and the form variante, you don't have to fetch all skills everytime, but the skills my vary depending on the form paramters!
   console.log("saveAll function started..");
   //gets the action url from the nav data sent by the frontend
   let { action } = data;
  
   if(docData.type === 'saveCustom'){
    res.status(200).end();

    await executeVariant(data.inputs, homePage, {
      execute: async (inputs, redirect) => {
        const { cookies, redirected, weirdData } = redirect.send({});

        const config = {
          ...data,
          inputs,
          action,
          cookies,
          from: redirected,
          weirdData,
          isPrimary,
        };
        const response = await executeSkillEdits(config, isPrimary, redirect);

        action = response.action; // CHECK this is might be the cause of paralism not working
        redirect.setWeiredData(response.weirdData);
      },

      fetchOptions: async (inputs, name, redirect) => {
        const { cookies, redirected, weirdData } = redirect.send({});
        const response = await fetchOptions(
          {
            inputs,
            action,
            actionButtons: [],
            name,
            cookies,
            from: redirected,
            weirdData,
            isPrimary: isPrimary,
          },
          redirect
        );

        return response.toJson().inputs.filter((e) => e.options.length);
      },
      customSelect: [
        {
          name: "ctl00$PlaceHolderMain$ddlStudySystem",
          value: "منتظم",
        },
        {
          name: data.period
            ? "ctl00$PlaceHolderMain$ddlPeriod"
            : "edzedze",
          value: data.period ?? "dsdsdsd",
        },
      ],
    });

   } 
   else{
    res.status(200).end();

   //recursive function
   await executeAllPossible(data.inputs, homePage, {
    execute: async (inputs, redirect) => {
      const { cookies, redirected, weirdData } = redirect.send({});

      const config = {
        ...data,
        inputs,
        action,
        cookies,
        from: redirected,
        weirdData,
        isPrimary,
      };
      const response = await executeSkillEdits(config, isPrimary, redirect);

      action = response.action; // CHECK this is might be the cause of paralism not working
      redirect.setWeiredData(response.weirdData);
    },

    fetchOptions: async (inputs, name, redirect) => {
      const { cookies, redirected, weirdData } = redirect.send({});
      const response = await fetchOptions(
        {
          inputs,
          action,
          actionButtons: [],
          name,
          cookies,
          from: redirected,
          weirdData,
          isPrimary: isPrimary,
        },
        redirect
      );

      return response.toJson().inputs.filter((e) => e.options.length);
    },
    customSelect: [
      {
        name: "ctl00$PlaceHolderMain$ddlStudySystem",
        value: "منتظم",
      },
      {
        name: data.period ? "ctl00$PlaceHolderMain$ddlPeriod" : "edzedze",
        value: data.period ?? "dsdsdsd",
      },
    ],
  });

  //updates the task refrence in the db when everything is complete
  //and removes the task payload object
   }

   await doc.ref.update({ completed: true, payload: {} });

   console.log("############################################");
  } catch (error) {
    console.log(error)
  }
  
})



async function executeSkillEdits(
  data: NavigationData,
  isPrimary: boolean,
  homePage: Redirect
) {
  const response = await fetchSkills(data, isPrimary, homePage);

  // get all the skills with thier ids
  let { action, skills, inputs } = response.toJson();
  console.log('skills ')
  console.log(skills)
  // submit
  let editedSkill = skills.map((s) => ({
    id: s.id,
    skillId: s.skillId.toString(),
    value: data.rate,
  }));
  const savedResponse = await saveSkills(
    {
      ...data,
      inputs,
      action,
      isPrimary,
      skills: editedSkill,
    },
    homePage
  );

  return savedResponse.toJson();
}
