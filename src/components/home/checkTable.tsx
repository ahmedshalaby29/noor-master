import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  head: string[];
  action: string;
  onAction: (id: string) => void;
  onSelecte: (ids: string[]) => void;
  items: {
    id: string;
    childs: string[];
  }[];
}

const CheckTable: React.FC<Props> = ({
  head,
  action,
  items,
  onAction,
  onSelecte,
}) => {
  const checkbox = useRef<HTMLInputElement>();
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    onSelecte(selectedItems);
  }, [selectedItems]);

  useLayoutEffect(() => {
    const isIndeterminate =
      selectedItems.length > 0 && selectedItems.length < items.length;
    setChecked(selectedItems.length === items.length);
    setIndeterminate(isIndeterminate);
    checkbox.current!.indeterminate = isIndeterminate;
  }, [selectedItems]);

  function toggleAll() {
    setSelectedItems(checked || indeterminate ? [] : items.map((e) => e.id));
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  return (
    <div className=" sm:px-6 lg:px-8 font-arabic">
      <div className="mt-8 flex flex-col  w-full">
        <div className="-my-2 max-w-xs sm:max-w-none  overflow-x-auto sm:-mx-6 sm:px-2 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle ">
            <div className="relative overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table
                style={{ direction: "rtl" }}
                className="min-w-full table-fixed divide-y divide-gray-300"
              >
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="relative px-1 sm:w-16 sm:px-8">
                      <input
                        type="checkbox"
                        className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                        ref={checkbox as any}
                        checked={checked}
                        onChange={toggleAll}
                      />
                    </th>

                    {head.map((th, i) => {
                      if (i == 0)
                        return (
                          <th
                            key={i}
                            scope="col"
                            className="sm:min-w-[12rem] py-3.5 pr-3 text-right text-sm font-semibold text-gray-900"
                          >
                            {th}
                          </th>
                        );
                      return (
                        <th
                          key={i}
                          scope="col"
                          className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                        >
                          {th}
                        </th>
                      );
                    })}

                    <th
                      scope="col"
                      className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900"
                    ></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        selectedItems.includes(item.id)
                          ? "bg-gray-50"
                          : undefined
                      }
                    >
                      <td className="relative w-12 px-6 sm:w-16 sm:px-8">
                        {selectedItems.includes(item.id) && (
                          <div className="absolute inset-y-0 left-0 w-0.5 bg-indigo-600" />
                        )}
                        <input
                          type="checkbox"
                          className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 sm:left-6"
                          value={item.id}
                          checked={selectedItems.includes(item.id)}
                          onChange={(e) =>
                            setSelectedItems(
                              e.target.checked
                                ? [...selectedItems, item.id]
                                : selectedItems.filter((p) => p !== item.id)
                            )
                          }
                        />
                      </td>
                      {item.childs.map((child, i) => {
                        if (i == 0)
                          return (
                            <td
                              key={i}
                              className={classNames(
                                "whitespace-nowrap py-4 pr-3 text-sm font-medium",
                                selectedItems.includes(item.id)
                                  ? "text-indigo-600"
                                  : "text-gray-900"
                              )}
                            >
                              {child}
                            </td>
                          );
                        else
                          return (
                            <td
                              key={i}
                              className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"
                            >
                              {child}
                            </td>
                          );
                      })}

                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => onAction(item.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckTable;
