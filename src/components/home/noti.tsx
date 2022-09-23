import React from "react";

interface NotiProps {
  text: string;
  color: "indigo" | "green" | "yellow" | "red";
}

const Noti: React.FC<NotiProps> = ({ text, color }) => {
  return (
      <div className="w-full text-center">
    <div className="my-6 pl-4 flex sm:inline-flex flex-row-reverse sm:items-center bg-red-100 ">
      <div
        className={`h-8 ml-4 w-1 

        ${color == "indigo" ? "bg-indigo-300" : ""}
        ${color == "green" ? "bg-green-300" : ""}
        ${color == "yellow" ? "bg-yellow-300" : ""}
        ${color == "red" ? "bg-red-300" : ""}
    `}
      ></div>
      <p
        className={`flex-1 pt-2 sm:pt-0 font-arabic text-right
    
    ${color == "indigo" ? "text-indigo-800" : ""}
    ${color == "green" ? "text-green-800" : ""}
    ${color == "yellow" ? "text-yellow-800" : ""}
    ${color == "red" ? "text-red-800" : ""}
    `}
      >
        {text}
      </p>
    </div>
    </div>
  );
};

export default Noti;
