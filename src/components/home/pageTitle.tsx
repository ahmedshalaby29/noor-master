import React from "react";

interface PageTitleProps {
  title: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <div className="flex mt-4 md:mt-0 flex-col justify-center items-center w-full space-y-2">
      <h2 className="text-lg text-zinc-800 font-arabic">{title}</h2>
      <div className="h-1 w-10 bg-indigo-400 rounded-md"></div>
    </div>
  );
};

export default PageTitle;
