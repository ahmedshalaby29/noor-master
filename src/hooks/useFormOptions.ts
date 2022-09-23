import { useEffect, useMemo, useState } from "react";
import Repository from "../repository";
import {
  Form,
  FormInput,
  FormSubmit,
  FormSubmitLookup
} from "../types/communication_types";

interface Props {
  label?: {};
  excludedIds?: string[];
  excludedNames?: string[];
  actionName?: string;
  isPrimary:boolean;
}

type SubmitType = <
  T extends FormSubmitLookup["type"],
  B extends Omit<FormSubmitLookup & { type: T }, "type">,
  C extends Omit<B["payload"], keyof FormSubmit>,
  D extends FormSubmitLookup & { type: T }
>(
  type: T,
  payload: C
) => Promise<D["response"]["payload"]>;

const createPath = (x: {}) => Object.values(x).join("-");

// todo use label to cach data
export default ({ isPrimary, excludedIds, excludedNames, actionName }: Props) => {
  const [form, setForm] = useState<Form>();
  const [inputs, setInputs] = useState<FormInput[]>([]);
  const [loadingIndex, setLoadinIndex] = useState(100);

  const visibleInputs = inputs.filter(
    (e) =>
      !withinIncludes(e.id, excludedIds) &&
      !withinIncludes(e.name ?? "", excludedNames)
  );

  const isAllChosen = useMemo(
    () =>
      visibleInputs.every((inp) => {
        const selected = inp.options.find((e) => e.selected);
        if (!selected) return false;
        if (selected.text == "اختر" || selected.text == "لا يوجد") return false;
        return true;
      }),
    [inputs]
  );

  const updateInputs = async (name: string, value: string) => {
    let requireUpdate = false;
    const newInputs = inputs.map((inp, i) => {
      if (inp.name != name) return inp;
      else {
        if (!inp.options.find((e) => e.selected && e.value == value)) {
          requireUpdate = true;
        }
        return {
          ...inp,
          options: inp.options.map((e) => ({
            ...e,
            selected: e.value == value,
          })),
        };
      }
    });

    if (requireUpdate) {
      setInputs(newInputs);
      await fetchOptions(newInputs, name, value);
    }
  };

  async function fetchOptions(
    inputs: FormInput[],
    name: string,
    value: string
  ) {
    const index = inputs.findIndex((e) => e.name == name);
    setLoadinIndex(-1);
    if (true && index + 1 < inputs.length) {
      const { form: newForm } = await Repository.instance.formFetchOption({
        action: form!.action,
        name,
        inputs,
        actionButtons: form!.actionButtons,
      });

      setForm(newForm);
    }
    setLoadinIndex(1000);
  }

  const submit: SubmitType = async (type, payload) => {
    const actionButton = form?.actionButtons.find((e) =>
      e.name?.includes(actionName ?? "")
    );

   
    setLoadinIndex(-1);
    const action = await Repository.instance.submitForm(type, {
      ...payload, // CHECK should i deconstruct the payload or not
      action: form!.action,
      actionButton: actionButton!,
      inputs: inputs,
      isPrimary,
    });

    setLoadinIndex(1000);

    return action as any;
  };

  const letMeHandleIt = () => {
    const actionButton = form?.actionButtons.find((e) =>
      e.name?.includes(actionName ?? "")
    );

    return {
      ...Repository.instance.trustMe(),
      action: form!.action,
      actionButton: actionButton!,
      inputs: inputs,
    };
  };

  useEffect(() => {
    if (form) {
      setInputs(formatInputs(form.inputs));
    }
  }, [form]);

  return {
    updateInputs,
    inputs: visibleInputs,
    setForm,
    formAction: form?.action,
    loadingIndex,
    submit,
    isAllChosen,
    letMeHandleIt,
  };
};

function withinIncludes(id: string, ids?: string[]) {
  if (!ids) return false;
  else {
    return ids.some((e) => id.includes(e));
  }
}

function formatInputs(inputs: FormInput[]) {
  const formated = inputs
    .map((input, i) => ({
      ...input,
      title: input.title.replaceAll("*", ""),
      options: input.options.map((e) => ({
        ...e,
        text: e.text.replaceAll("--", "").trim(),
      })),
    }))
    // CHECK e.options for inputs that provide only informations!
    .filter((e) => e.value != undefined && e.title != "" && e.options.length);

  const first: FormInput[] = [];
  const last: FormInput[] = [];
  let flip = false;

  formated .forEach((inp) => {
    if (inp.name?.includes("$ddlSpecialty")) {
      return first.push(inp);
    }
    if (flip) last.push(inp);
    else first.push(inp);
    if (inp.name?.includes("$ddlClass")) {
      flip = true;
    }
  });
  // todo sort the inputs so the class comes before

  return [...first, ...last];
}
