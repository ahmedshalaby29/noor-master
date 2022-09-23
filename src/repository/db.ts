import {
  addDoc,
  collection,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  Firestore,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { emulator, firebaseApp } from "../main";
import { BackgroundTask, Report, Teacher } from "../models/home_model";

export default class DB {
  private firestore: Firestore;
  private static _instance?: DB;

  static get instance() {
    if (!DB._instance) {
      DB._instance = new DB();
    }
    return DB._instance!;
  }
  constructor() {
    this.firestore = getFirestore(firebaseApp);

    if (emulator) {
      connectFirestoreEmulator(this.firestore, "localhost", 8080);
    }
  }

  subscribeToTeacher(id: string, listener: (teacher: Teacher) => void) {
    console.log("fetching ", id);
    const teacherDoc = doc(this.firestore, `users/${id}`);

    return onSnapshot(teacherDoc, {}, (snapshot) => {
      if (snapshot.exists()) {
        listener(snapshot.data() as Teacher);
      }
    });
  }

  subscribeToTasks(
    userId: string,
    listener: (task: BackgroundTask<any>, deleted: boolean) => void
  ) {
    const ref = collection(this.firestore, "tasks");
    const tasksquery = query(
      ref,
      where("user", "==", userId),
      where("completed", "!=", true)
    );

    return onSnapshot(tasksquery, {}, (snapshot) => {
      snapshot.docChanges().forEach((doc) => {
        const data = doc.doc.data();
        listener(
          {
            ...data,
            created: data.created.toDate(),
            id: doc.doc.id,
          } as any,
          doc.type == "removed"
        );
      });
    });
  }

  async createTask(task: BackgroundTask<any>) {
    const tasks = collection(this.firestore, "tasks");
    await addDoc(tasks, {
      ...task,
      created:Timestamp.fromDate(task.created)
    });
  }

  async getReports(userId: string) {
    const ref = collection(this.firestore, "reports");
    const reportsQuery = query(ref, where("user", "==", userId));
    const docs = await getDocs(reportsQuery);
    return docs.docs.map((doc) => {
      return {
        ...doc.data(),
        id: doc.id,
      };
    }) as any as Report[];
  }

  async deleteReport(id: string) {
    const report = doc(this.firestore, `reports/${id}`);
    await deleteDoc(report);
  }
}
