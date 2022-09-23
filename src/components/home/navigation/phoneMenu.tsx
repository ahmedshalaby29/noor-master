import { Menu } from "@headlessui/react";
import { useContext } from "react";
import { Menu as Humberger } from "react-feather";
import { Link } from "react-router-dom";
import { HomeContext } from "../../../context/homeContext";
import { HomeTab } from "../../../models/home_model";
import { tabBarTitle } from "../../../utils";

interface props {
  items: HomeTab[];
  selected: HomeTab;
}
const PhoneMenu: React.FC<props> = ({ items, selected }) => {
  const { tasks ,teacherType} = useContext(HomeContext);

  return (
    <Menu>
      <Menu.Button className="md:hidden ml-2">
        <Humberger className="text-indigo-500" />
      </Menu.Button>

      <Menu.Items className="fixed  z-50 py-12  right-0 top-0 h-full   bg-indigo-400 shadow-md">
        {items.map((i) => (
          <Menu.Item key={i}>
            {({ active }) => (
              <Link
                to={i}
                className={`flex w-56
              
              ${!tasks.length ? "" : "pointer-events-none"}
              `}
              >
                {(active || i == selected) && (
                  <div className="w-1 rounded-r-full bg-indigo-200 h-auto"></div>
                )}

                <div
                  className={`w-full py-3 pr-4 text-right flex-1 ${
                    active || i == selected
                      ? "bg-indigo-500/20 text-indigo-100"
                      : "text-indigo-50"
                  }`}
                >
                  {tabBarTitle(i,teacherType!)}
                </div>
              </Link>
            )}
          </Menu.Item>
        ))}
      </Menu.Items>
    </Menu>
  );
};

export default PhoneMenu;
