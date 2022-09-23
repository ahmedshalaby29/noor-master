import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import {
  CheckCircle as CheckIcon,
  List,
  CheckSquare as CheckSquaretorIcon,
  ChevronsDown,
} from "react-feather";

interface Props {
  options?: string[];
  current?: string;
  select(option: string): void;
}

const SelectRole: React.FC<Props> = ({ options, current, select }) => {
  return (
    <div className=" max-w-xs w-full md:w-72 ">
      {!options && (
        <div>
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-3 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      )}
      {options && current && (
        <Listbox
          value={current}
          onChange={select}
          disabled={options.length < 2}
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full py-2 md:pl-3 md:pr-10 text-right rounded-lg  cursor-default focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-orange-300 focus-visible:ring-offset-2 focus-visible:border-indigo-500 sm:text-sm">
              <span className="absolute inset-y-0 left-0 flex flex-row-reverse md:flex-row items-center pr-2 pointer-events-none">
                <ChevronsDown
                  className="w-5 h-5 text-indigo-500"
                  aria-hidden="true"
                />
              </span>
              <span
                className="block truncate text-right"
                style={{ direction: "rtl" }}
              >
                {current.slice(0, 40)}
              </span>
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-80 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {options.map((person, personIdx) => (
                  <Listbox.Option
                    key={personIdx}
                    style={{ direction: "rtl" }}
                    className={({ active }) =>
                      `cursor-default select-none relative py-2 pl-10 pr-4 ${
                        active
                          ? "text-indigo-900 bg-indigo-100"
                          : "text-gray-900"
                      }`
                    }
                    value={person}
                  >
                    {({ selected }) => (
                      <>
                        <span
                          className={`block truncate text-right ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {person}
                        </span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </Listbox>
      )}
    </div>
  );
};

export default SelectRole;
