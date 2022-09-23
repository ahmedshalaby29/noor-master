import { User } from "firebase/auth";
import { useState } from "react";
import { Teacher } from "../models/home_model";
import DB from "../repository/db";
import useIfIffect from "./useIfEffect";

type params = {
  user?: User;
};

function dateDiffInDays(end: number, start: number) {
  const diff = (end - start) / 1000;
  const diffDay = diff / 60 / 60 / 24;

  return Math.round(diffDay) + " day" + (diffDay > 1 ? "s" : "");
}



const useFetchTeacher = ({ user }: params) => {
  const [teacher, setTeacher] = useState<Teacher>();

  useIfIffect(() => {
    // todo remove the subscription
    // CHECK should i get the teacher doc everytime!
    return DB.instance.subscribeToTeacher(user!.uid, (data) => {
      setTeacher({
        ...data,
        isPro:
          data.try - Date.now() > 259200000
            ? true
            : data.try > Date.now()
            ? dateDiffInDays(data.try, Date.now())
            : false,
      });
    });
  }, [user]);

  return teacher;
};

export default useFetchTeacher;
