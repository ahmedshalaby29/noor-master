import * as functions from "firebase-functions";
import { FormInput } from "../../../../core/form";
import Redirect from "../../../../core/redirect";
import { selectFromInputs } from "../../../../core/variatForm";
import { executeSkillEdits, NavigationData } from "../../../background/saveAll";

type ExcuteAllSubjectSkillsEditsData = {
  isPrimary;
  navData: NavigationData;
  inputs: FormInput[];
  redirect;
};

export default functions
  .region("asia-south1")
  .https.onRequest(async (req, res) => {
    const data = req.body as ExcuteAllSubjectSkillsEditsData;
    const { isPrimary, navData, inputs } = data;
    for (const option of inputs[inputs.length - 1].options) {
      const modifiedInputs = selectFromInputs(
        inputs.length - 1,
        inputs,
        option.text
      );
      const redirect = Redirect.load(navData);
      const { cookies, redirected, weirdData } = redirect.send({});
      let { action } = navData;
      const config = {
        ...navData,
        modifiedInputs,
        action,
        cookies,
        from: redirected,
        weirdData,
        isPrimary,
      };
      const response = await executeSkillEdits(config, isPrimary, redirect);

      action = response.action; // CHECK this is might be the cause of paralism not working
      redirect.setWeiredData(response.weirdData);
    }
  });
