import React from "react";

interface systemMessageProps {
  message: string;
}

const systemMessage: React.FC<systemMessageProps> = ({ message }) => {
  return (
    <div className="mb-8">
      <p dir="rtl" className="text-sm text-orange-400 font-semibold	">
        {message}
      </p>
    </div>
  );
};

export default systemMessage;
