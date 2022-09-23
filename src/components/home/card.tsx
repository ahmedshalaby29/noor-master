import React from "react";
import LoaderImage from "../../assets/loading.gif";

interface CardProps {
  loading: boolean;
}

const Card: React.FC<CardProps> = ({ children, loading }) => {
  return (
    <div
      style={{ minHeight: "30%" }}
      className="flex-1 relative flex flex-col w-full h-full p-4 bg-white rounded-md shadow"
    >
      {loading && (
        <div className="absolute z-30 inset-0 bg-indigo-200/50 flex items-center justify-center">
          <img
            src={LoaderImage}
            className="bg-transparent w-24 aspect-square"
          />
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
