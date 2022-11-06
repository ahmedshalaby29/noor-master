import { clone, randomDelay } from "../utils";
import { FormInput } from "./form";
import Redirect from "./redirect";
import http from "axios";
import { NavigationData } from "../endpoints/background/saveAll";
//const util = require("util");
export function createdPath(inputs: FormInput[]) {
  let path = "";

  for (const inp of inputs) {
    const options = removeEmpty(inp.options);
    if (!options.length) return null;
    else {
      const selected = options.find((i) => i.selected).text;
      path += selected;
    }
  }
  return path;
}

// FIXME antypattern

//BUG racing with WeiredData !
export async function executeAllPossible(
  isPrimary,
  navData: NavigationData,
  inputsOrg: FormInput[],
  redirect: Redirect,
  config: {
    fetchOptions(
      inputs: FormInput[],
      name: string,
      redirect: Redirect
    ): Promise<FormInput[]>;
    customSelect: { name: string; value: string }[];
  },
  i: number = 0
): Promise<any> {
  const inputs = clone(inputsOrg);
  /*
  console.log(
    util.inspect(inputs, { showHidden: false, depth: null, colors: true })
  );
  */
  console.log("i: " + i);

  if (i + 1 > inputs.length) {
    console.log("executing..");

    const url =
      "http://localhost:5001/formal-ember-345513/asia-south1/excuteAllSubjectSkillsEdits";
   return await http.post(url, {
      isPrimary,
      navData,
      inputs,
      redirect: redirect.send({}),
    });
  }
  const current = inputs[i];

  const options = removeEmpty(current.options);

  if (options.length) {
    const isTarget = config.customSelect.find((e) => e.name == current.name);
    if (isTarget) {
      const inputsWithSelectedOption = selectFromInputs(
        i,
        inputs,
        isTarget.value
      );

      const filled = await config.fetchOptions(
        inputsWithSelectedOption,
        current.name,
        redirect
      );
      console.log("executeAllPossible i: " + i + 1);
      return await executeAllPossible(
        isPrimary,
        navData,
        filled,
        redirect,
        config,
        i + 1
      );
    } else if (containExactOpt(options, "الكل")) {
      current.options = selectOpt(options, "الكل");
      console.log("executeAllPossible i: " + i + 1);

      return await executeAllPossible(
        isPrimary,

        navData,
        inputs,
        redirect,
        config,
        i + 1
      );
    } else {
      for (const option of options) {
        const inputsWithSelectedOption = selectFromInputs(
          i,
          inputs,
          option.text
        );
        const filled = await config.fetchOptions(
          inputsWithSelectedOption,
          current.name,
          redirect
        );
        console.log("executeAllPossible i: " + i + 1);

        return await executeAllPossible(
          isPrimary,

          navData,
          filled,
          redirect,
          config,
          i + 1
        );
      }
    }
  }
  console.log("---------------------");
}

export function selectFromInputs(
  inputIndex: number,
  inputs: FormInput[],
  optionText: string
) {
  const targetInput = inputs[inputIndex];
  const left = inputs.slice(0, inputIndex);
  const options = targetInput.options;
  const right = inputs.slice(inputIndex+ 1);
  
  return [
    ...left,
    {
      ...targetInput,
      options: selectOpt(options, optionText),
    },
    ...right,
  ];
}

export async function executeVariant(
  inputsOrg: FormInput[],
  redirect: Redirect,
  config: {
    execute(inputs: FormInput[], redirect: Redirect): Promise<any>;
    fetchOptions(
      inputs: FormInput[],
      name: string,
      redirect: Redirect
    ): Promise<FormInput[]>;
    customSelect: { name: string; value: string }[];
    walked?: Set<string>;
    isDone?: boolean;
  },
  i: number = 0
): Promise<any> {
  const inputs = clone(inputsOrg);

  if (!config.walked) {
    config.walked = new Set();
    config.isDone = false;
  }

  if (config.isDone) return;

  const last = removeEmpty(inputs[inputs.length - 1].options);
  if (i + 1 > inputs.length && getSelected(last)) {
    const currentPath = createdPath(inputs);
    // FIXME checking here means one wasted network iteration!
    if (currentPath && config.walked.has(currentPath)) {
      config.isDone = true;
      return;
    } else {
      config.walked.add(currentPath);
      await randomDelay(100);
      return config.execute(inputs, redirect);
    }
  } else if (i - inputs.length > 0) {
    console.error(
      "iterated through all without catching the last input!",
      config
    );
    return;
  } else if (i + 1 > inputs.length && last.length) {
    i -= 1;
  }

  const current = inputs[i];
  const left = inputs.slice(0, i);
  const right = inputs.slice(i + 1);

  const options = removeEmpty(current.options);
  const nextInputOptions = removeEmpty(inputs[i + 1]?.options ?? []);

  // custom values
  const isTarget = config.customSelect.find((e) => e.name == current.name);
  if (isTarget) {
    current.options = selectOpt(options, isTarget.value);

    // fetch the previous one
    if (i > 1) {
      await config.fetchOptions(inputs, inputs[i - 1].name, redirect);
      const filled = await config.fetchOptions(
        inputs,
        inputs[i - 1].name,
        redirect
      );
      filled[i].options = selectOpt(
        removeEmpty(filled[i].options),
        isTarget.value
      );
      return await executeVariant(filled, redirect, config, i + 1);
    } else {
      return await executeVariant(inputs, redirect, config, i + 1);
    }
  }

  // select all if this option exists
  if (!getSelected(options) && containExactOpt(options, "الكل")) {
    current.options = selectOpt(options, "الكل");
    return await executeVariant(inputs, redirect, config, i + 1);

    // in case of the current options is empty fetch from the parent
  } else if (!options.length) {
    const filled = await config.fetchOptions(
      inputs,
      inputs[i - 1].name,
      redirect
    );

    if (!removeEmpty(filled[i].options).length) {
      return;
    }
    const gotNewInputField = filled.length != inputs.length;

    return await executeVariant(
      filled,
      redirect,
      config,
      i + (gotNewInputField ? -1 : 0)
    );
  } else if (
    getSelected(options) &&
    !nextInputOptions.length &&
    i + 1 < inputs.length
  ) {
    const filled = await config.fetchOptions(inputs, current.name, redirect);
    return await executeVariant(filled, redirect, config, i + 2);
  } else if (getSelected(options)) {
    return await executeVariant(inputs, redirect, config, i + 1);
  } else {
    const alls: Promise<any>[] = [];
    for (const e of options) {
      let request = executeVariant(
        [
          ...left,
          {
            ...current,
            options: selectOpt(options, e.text),
          },
          ...right,
        ],
        redirect,
        config,
        i + 1
      );

      if (last.length) {
        alls.push(request);
      } else await request;
    }

    await Promise.allSettled(alls);
    console.log("---------------------");
  }
}

// replace -- الكل -- to الكل
export function clean(x: string) {
  return x.replace(/--/g, "").trim();
}

export function selectOpt(ops: FormInput["options"], text: string) {
  const options = ops.map((e) => ({
    ...e,
    selected: clean(e.text) == clean(text),
  }));
  return options;
}

export function containExactOpt(ops: FormInput["options"], text: string) {
  return ops.some((e) => clean(e.text) == clean(text));
}

export function removeEmpty(ops: FormInput["options"]) {
  return ops.filter(
    (e) =>
      !e.text.includes("-- لا يوجد --") &&
      !e.text.includes("-- اختر --") &&
      e.text != "لا يوجد" &&
      e.text != "اختر"
  );
}

export function getSelected(ops: FormInput["options"]) {
  return ops.find((d) => d.selected);
}
