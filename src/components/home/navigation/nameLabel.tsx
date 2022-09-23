import React from "react";

type params = {
  name?: string;
};

const NameLabel: React.FC<params> = ({ name }) => {
  if (!name) {
    return (
        <div className="animate-pulse w-20 ">
          <div className="flex-1 space-y-6 py-1">
            <div className="h-3 bg-slate-200 rounded"></div>
          </div>
      </div>
    );
  }
  return (
    <div className="px-2 py-1 rounded-xl text-zinc-800">{name}</div>
  );
};

export default NameLabel;
