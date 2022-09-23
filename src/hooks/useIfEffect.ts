import { useEffect } from "react";

type FCT = () => void | (() => any);
interface useIfIffectProps {}

const useIfIffect = (fct: FCT, dep: any[]) => {
  useEffect(() => {
    if (dep.every(Boolean)) {
      return fct();
    }
  }, [...dep]);
};

export default useIfIffect;
