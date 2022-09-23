import React from "react";
import { Loader } from "react-feather";

interface LoadingProps {}

const Loading: React.FC<LoadingProps> = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-200">
      <Loader className="w-24 h-24 animate-spin text-indigo-500" />
    </div>
  );
};

export default Loading;
