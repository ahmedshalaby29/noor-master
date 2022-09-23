import React, { useContext } from "react";
import { Loader } from "react-feather";
import { AppContext } from "../../context/appContext";
import { HomeContext } from "../../context/homeContext";

interface OnboardingProps {}

const Onboarding: React.FC<OnboardingProps> = () => {
  const { user } = useContext(AppContext);
  const { teacher } = useContext(HomeContext);

  if (!(user?.displayName) && !teacher) {
    return (
      <div className="w-full  h-72 flex justify-center items-center">
        <div className="max-w-sm w-full p-3 pr-8 flex flex-row-reverse items-center font-arabic bg-indigo-100 rounded-lg">
          <Loader className="animate-spin w-6 h-6 text-indigo-400" />
          <span className="text-indigo-500 mr-8">جاري انشاء الحساب </span>
        </div>
      </div>
    );
  }

  return (
<></>
  );
};

export default Onboarding;
