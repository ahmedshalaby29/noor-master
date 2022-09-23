import React from "react";
import { Save, Loader } from "react-feather";

interface CustomButtonProps {
  onClick(): void;
  loading?: boolean;
  icon?: boolean;
  secondary?: boolean;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  loading,
  icon = true,
  secondary,
  disabled = false,
}) => {
  return (
    <button
      disabled={loading || disabled}
      onClick={onClick}
      type="button"
      className={`inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md   ${
        !secondary
          ?  "bg-indigo-600 text-white hover:bg-indigo-700"
          : "border-2 hover:bg-indigo-100  border-indigo-300 text-indigo-600"
      } focus:outline-none focus:border-transparent focus:ring-2 focus:ring-offset-2  focus:ring-indigo-500
        ${!secondary?"disabled:bg-indigo-400":"disabled:bg-slate-200"}
      `}
    >
      {children}
      {!loading && icon && (
        <Save className="ml-2 -mr-0.5 h-4 w-4" aria-hidden="true" />
      )}
      {loading && (
        <Loader
          className="animate-spin ml-2 -mr-0.5 h-4 w-4"
          aria-hidden="true"
        />
      )}
    </button>
  );
};

export default CustomButton;
