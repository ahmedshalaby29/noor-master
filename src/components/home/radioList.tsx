import { useEffect, useState } from "react";
import { RadioGroup } from "@headlessui/react";

export type RadioListItem = {
  id: string | number;
  name: string;
  description: string;
};

interface RadioList {
  items: RadioListItem[];
  onSelect(id: string | number): void;
  title: string;
  disabled: boolean;
  current?: RadioListItem;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const RadioList: React.FC<RadioList> = ({
  items,
  disabled,
  onSelect,
  title,
  current,
}) => {
  const [selected, setSelected] = useState<RadioListItem>();

  useEffect(() => {
    if (current) {
      setSelected(current);
    }
  });

  useEffect(() => {
    if (selected) onSelect(selected.id);
  }, [selected]);

  return (
    <RadioGroup
      disabled={disabled}
      className="font-arabic"
      value={selected}
      onChange={setSelected}
    >
      <RadioGroup.Label className="sr-only">{title}</RadioGroup.Label>
      <div className="bg-white rounded-md -space-y-px">
        {items.map((setting, settingIdx) => (
          <RadioGroup.Option
            key={setting.id}
            value={setting}
            className={({ checked }) =>
              classNames(
                "text-right",
                settingIdx === 0 ? "rounded-tl-md rounded-tr-md" : "",
                settingIdx === items.length - 1
                  ? "rounded-bl-md rounded-br-md"
                  : "",
                checked
                  ? "bg-indigo-50 border-indigo-200 z-10"
                  : "border-gray-200",
                "relative border p-4 flex flex-row-reverse cursor-pointer focus:outline-none"
              )
            }
          >
            {({ active, checked }) => (
              <>
                <span
                  className={classNames(
                    checked
                      ? "bg-indigo-600 border-transparent"
                      : "bg-white border-gray-300",
                    active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                    "h-4 w-4 mt-0.5 cursor-pointer rounded-full border flex items-center justify-center"
                  )}
                  aria-hidden="true"
                >
                  <span className="rounded-full bg-white w-1.5 h-1.5" />
                </span>
                <div className="mr-3 flex flex-col">
                  <RadioGroup.Label
                    as="span"
                    className={classNames(
                      checked ? "text-indigo-900" : "text-gray-900",
                      "block text-sm font-medium text-right"
                    )}
                  >
                    {setting.name}
                  </RadioGroup.Label>
                  <RadioGroup.Description
                    as="span"
                    className={classNames(
                      checked ? "text-indigo-700" : "text-gray-500",
                      "block text-sm text-right"
                    )}
                  >
                    {setting.description}
                  </RadioGroup.Description>
                </div>
              </>
            )}
          </RadioGroup.Option>
        ))}
      </div>
    </RadioGroup>
  );
};

export default RadioList;
