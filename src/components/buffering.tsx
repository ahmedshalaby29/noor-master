import React from "react";
import LoaderImage from "../../src/assets/loading.gif";

interface BufferingProps {}

const Buffering: React.FC<BufferingProps> = () => {
  return (
    <div className="absolute z-30 inset-0 bg-indigo-200/50 flex items-center justify-center">
      <img src={LoaderImage} className="bg-transparent w-24 aspect-square" />
    </div>
  );
};

export default Buffering;
