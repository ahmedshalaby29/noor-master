import React, {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
} from "react";
import homeAction from "../actions/homeAction";
import useFetchTeacher from "../hooks/useFetchTeacher";
import useIfIffect from "../hooks/useIfEffect";
import {
  HomeStateInit,
  HomeTab,
  IHomeProvider,
  TeacherType,
} from "../models/home_model";
import Repository from "../repository";
import DB from "../repository/db";
import { diffInMinutes } from "../utils";
import { AppContext } from "./appContext";

export const HomeContext = createContext<IHomeProvider>(null!);

const HomeProvider: React.FC = ({ children }) => {
  console.log("creating the context!");
  const [state, dispatch] = useReducer(homeAction, HomeStateInit);
  const { user, logout, refrechToken } = useContext(AppContext);

  const [showSuccess, setShowSuccess] = useState(false);

  const teacher = useFetchTeacher({ user });

  useIfIffect(() => {
    refrechToken(teacher?.try);
  }, [teacher != null]);

  useEffect(() => {
    if (Repository.instance.isExpired()) {
      logout();
    } else {
      console.log("subscribing to the task list");
      return DB.instance.subscribeToTasks(user!.uid, (task, isDeleted) => {
        const oldByMinutes = 10;
        const isNew = diffInMinutes(task.created, new Date()) < oldByMinutes;
        if (isDeleted) {
          dispatch({ type: "deleteTask", payload: task.id! });

          setShowSuccess(true);
        } else if (isNew) {
          dispatch({ type: "addTask", payload: task });

          setTimeout(() => {
            dispatch({ type: "deleteTask", payload: task.id! });
          }, 1000 * 60 * oldByMinutes);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (teacher) {
      dispatch({ type: "setTeacher", payload: teacher });
      dispatch({ type: "setRole", payload: teacher.currentRole });
      const type = getTeacherType(teacher.currentRole);
      dispatch({ type: "setTeacherType", payload: type });
      dispatch({ type: "setTab", payload: HomeTab.home });
    }
  }, [teacher]);

  useEffect(() => {
    const type = getTeacherType(state.currentRole);
    dispatch({ type: "setTeacherType", payload: type });
    dispatch({ type: "setTabs", payload: getTeacherTabs(type) });
    dispatch({ type: "setTab", payload: HomeTab.home });
  }, [state.currentRole]);

  const getTeacherTabs = (type: TeacherType) => {
    if (type == TeacherType.elementery)
      return [
        HomeTab.savedegree,
        HomeTab.saveReport,
        HomeTab.savedReports,
        HomeTab.logout,
      ];
    else if (type == TeacherType.kindergarten)
      return [
        HomeTab.saveAll,
        HomeTab.saveCustom,
        HomeTab.editSkill,
        HomeTab.saveReport,
        HomeTab.savedReports,
        HomeTab.logout,
      ];
    return [
      HomeTab.savePeriod,
      HomeTab.saveCustom,
      HomeTab.editSkill,
      HomeTab.didntGet,
      HomeTab.savedegree,
      HomeTab.saveReport,
      HomeTab.saveReportSkill,
      HomeTab.savedReports,
      HomeTab.logout,
    ];
  };

  const getTeacherType = (currentRole?: string) => {
    if (!currentRole) return TeacherType.elementery;
    if (currentRole.includes("متوسط")) return TeacherType.elementery;
    if (currentRole.includes("روضة")) return TeacherType.kindergarten;

    return TeacherType.primary;
  };

  async function selectTab(tab: HomeTab) {
    if (tab == HomeTab.logout) {
      logout();
    } else {
      dispatch({ type: "setTab", payload: tab });
    }
  }

  function selectRole(role: string) {
    // todo save the role back to firestore
    dispatch({ type: "setRole", payload: role });
  }

  const values: IHomeProvider = {
    ...state,
    selectRole,
    selectTab,
    closeSuccess: () => setShowSuccess(false),
    showSuccess,
  };

  return <HomeContext.Provider value={values}>{children}</HomeContext.Provider>;
};

export default HomeProvider;
