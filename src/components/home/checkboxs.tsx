import { RadioGroup } from "@headlessui/react";
import React from "react";

type Option = {
  id: string;
  value: string;
  selected: boolean;
};
interface CheckBoxsProps {
  options: Option[];
  onSelect(id: string): void;
  className?: string;
}

const CheckBoxs: React.FC<CheckBoxsProps> = ({ options, className,onSelect }) => {
    const selected = options.find((e) => e.selected);


  return (
    <RadioGroup className={className} value={selected} onChange={e=>onSelect(e!.id)}>
      {options.map((o) => (
        <RadioGroup.Option key={o.id} value={o}>
          {({ checked }) => (
            <div
              className={`px-2 cursor-pointer  py-1 rounded-md text-sm shadow-sm border border-slate-500 
                  ${
                    checked
                      ? "bg-indigo-400 text-indigo-50 border-indigo-300"
                      : ""
                  } `}
            >
              {o.value}
            </div>
          )}
        </RadioGroup.Option>
      ))}
    </RadioGroup>
  );
};

export default CheckBoxs;
