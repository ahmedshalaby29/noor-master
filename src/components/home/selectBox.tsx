import { Listbox, Transition } from "@headlessui/react";
import React, { Fragment, useEffect, useLayoutEffect, useRef } from "react";
import { CheckSquare, ChevronDown } from "react-feather";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

type Option = {
  id: string;
  name: string;
  disabled?: boolean;
  selected: boolean;
};

interface Params {
  options: Option[];
  label: string;
  loading?: boolean;
  select(id: string): void;
}

const SelectBox: React.FC<Params> = ({ options, label, loading, select }) => {

  const selected = options.find((e) => e.selected) ?? options[0];
  return (
    <Listbox
      disabled={loading}
      value={selected}
      onChange={({ id }) => {
        select(id);
      }}
    >
      {({ open }) => (
        <>
          <Listbox.Label className="block text-right text-sm font-medium text-gray-700">
            {label}
          </Listbox.Label>
          <div className="mt-1 text-right relative">
            <Listbox.Button
              className={`relative w-full bg-white ${
                loading ? "animate-pulse bg-indigo-100" : ""
              }  border border-gray-300  rounded-md shadow-sm pl-3 pr-10 py-2 text-right cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
            >
              <span className="block truncate">{selected.name}</span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <PositionedAware options={options} />
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};

export default SelectBox;

function PositionedAware({ options }: { options: Option[] }) {
  const elm = useRef<HTMLUListElement>();
  useLayoutEffect(() => {
    if (elm.current) {
      console.log(elm);
      const rect = elm.current.getBoundingClientRect();
      if (rect.y + rect.height > window.innerHeight) {
        elm.current.style.bottom = "0px";
        console.log(elm.current.style.top);
      }
    }
  }, []);

  return (
    <Listbox.Options
      ref={elm as any}
      static
      className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
    >
      {options.map((person) => (
        <Listbox.Option
          key={person.id}
          className={({ active }) =>
            classNames(
              active ? "text-white bg-indigo-600" : "text-gray-900",
              "cursor-default text-right select-none relative py-2 pl-8 pr-4",
              person?.disabled ? "text-gray-600" : ""
            )
          }
          value={person}
        >
          {({ selected, active }) => (
            <>
              {selected ? (
                <span
                  className={classNames(
                    active ? "text-white" : "text-indigo-600",
                    "absolute inset-y-0 left-0 flex items-center pl-1.5"
                  )}
                >
                  <CheckSquare className="h-5 w-5" aria-hidden="true" />
                </span>
              ) : null}

              <span
                className={classNames(
                  selected ? "font-semibold" : "font-normal",
                  "block truncate"
                )}
              >
                {person.name}
              </span>
            </>
          )}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  );
}
