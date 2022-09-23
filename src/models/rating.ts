import { RadioListItem } from "../components/home/radioList";
import { TeacherType } from "./home_model";

export type Rating = RadioListItem[];

export default function rates(type: TeacherType) {
  if (type == TeacherType.kindergarten) return KinderRating;
  else if (type == TeacherType.elementery) return ElementeryRating;
  return PrimaryRating;
}

export const KinderRating: Rating = [
  {
    name: "أتقن",
    description: "",
    id: "1",
  },
  {
    name: "لم يتقن",
    description: "",
    id: "2",
  },
  {
    name: "إلى حد ما",
    description: "",
    id: "3",
  },
  {
    name: "غير محدد",
    description: "",
    id: "",
  },
];

export const PrimaryRating: Rating = [
  {
    name: "متقن للمعيار 100%",
    description: "",
    id: "1",
  },
  {
    name: "متقن للمعيار من 90% الى أقل من 100%",
    description: "",
    id: "3",
  },
  {
    name: "متقن للمعيار من 80% الى أقل من 90%",
    description: "",
    id: "4",
  },
  {
    name: "غير متقن للمعيار أقل من 80%",
    description: "",
    id: "0",
  },
  {
    name: "غائب",
    description: "",
    id: "2",
  },
  {
    name: "غير محدد",
    description: "",
    id: "",
  },
];

export const ElementeryRating: Rating = [
  {
    name: "جيد",
    description: "",
    id: "good",
  },
  {
    name: "سيء",
    description: "",
    id: "bad",
  },
  {
    name: "غير محدد",
    description: "",
    id: "unknown",
  },
  {
    name: "غير محدد",
    description: "",
    id: "somewhat",
  },
];

export function RateByName(arr: Rating, name: string) {
  return arr.find((e) => e.name == name) || arr[0];
}

export function RateById(arr: Rating, id: string) {
  return arr.find((e) => e.id == id) || arr[0];
}
