import {
  BouncingNavigation,
  FormInput,
  SaveAllSubmit,
  SavePeriodSubmit,
} from "../types/communication_types";

export enum TeacherType {
  kindergarten,
  elementery,
  primary,
}

export enum NoorSection {
  skill = "المهارات",
  exams = "الإختبارات",
}

export enum NoorSkill {
  moduleStudent = "إدخال نتائج المهارة على مستوى طالب ومادة",
  skillModuleChild = "إدخال نتائج المهارة على مستوى طفل ووحدة",
  moduleSkill = "إدخال نتائج الطلاب على مستوى المادة والمهارة",
  skillModuleSkill = "إدخال نتائج المهارة على مستوى وحدة ومهارة",
  notSaved = "الفصول الغير مرصدة مهاراتها",
  studentDidntGet = "قائمة المعارف والمهارات التي لم يتقنها الطالب",
}

export enum NoorExam {
  enter = "ادخال الدرجات",
}

export type Teacher = {
  name: string;
  id: string;
  try: number;
  isPro: boolean | string;
  role: string[];
  currentRole: string;
};

export enum BackgroundTaskType {
  saveAll = "saveAll",
  saveCustom = "saveCustom",
  savePeriod = "savePeriod",
}

export type BackgroundTask<T> = {
  id?: string;
  type: BackgroundTaskType;
  user: string;
  completed: boolean;
  payload: T & BouncingNavigation;
  isPrimary: boolean;
  created: Date;
};

export type Report = {
  user: string;
  id: string;
  files: {
    csv: string;
    pdf: string;
  };
  params: { [key: string]: FormInput["options"][0] };
  isEmpty: boolean;
};

export interface SaveAllTask extends BackgroundTask<SaveAllSubmit> {
  type: BackgroundTaskType.saveAll;
}
export interface SaveCustomTask extends BackgroundTask<SaveAllSubmit> {
  type: BackgroundTaskType.saveCustom;
}

export interface SavePeriodTask extends BackgroundTask<SavePeriodSubmit> {
  type: BackgroundTaskType.savePeriod;
}

export enum HomeTab {
  home = "/",
  saveAll = "saveall",
  savePeriod = "savePeriod",
  savedegree = "savedegree",
  editSkill = "editSkill",
  didntGet = "didntget",
  studentsNotAccepted = "notaccepted",
  savedReports = "reports",
  saveReport = "newreport",
  saveReportSkill = "newreport1",
  saveCustom = "savecustom",
  logout = "out",
}

export type HomeActions =
  | {
      type: "setRole";
      payload: string;
    }
  | {
      type: "addTask";
      payload: BackgroundTask<any>;
    }
  | {
      type: "deleteTask";
      payload: string;
    }
  | {
      type: "setTab";
      payload: HomeTab;
    }
  | {
      type: "setTeacher";
      payload: Teacher;
    }
  | {
      type: "setTabs";
      payload: HomeTab[];
    }
  | {
      type: "setTeacherType";
      payload: TeacherType;
    }
  | {
      type: "loading_off";
    }
  | {
      type: "loading_on";
    };

export type HomeState = {
  currentRole?: string;
  teacher?: Teacher;
  teacherType?: TeacherType;
  loading: boolean;
  tab: HomeTab;
  tabs: HomeTab[];
  tasks: BackgroundTask<any>[];
  showSuccess: boolean;
};

export const HomeStateInit: HomeState = {
  tab: HomeTab.home,
  loading: false,
  tabs: [],
  tasks: [],
  showSuccess: false,
};

export interface IHomeProvider extends HomeState {
  selectTab(tab: HomeTab): void;
  selectRole(role: string): void;
  closeSuccess(): void;
}
