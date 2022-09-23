import {
  getStorage,
  getDownloadURL,
  ref,
  FirebaseStorage,
} from "firebase/storage";
import { firebaseApp } from "../main";

export default class Storage {
  private bucket: FirebaseStorage;
  private static _instance?: Storage;

  static get instance() {
    if (!Storage._instance) {
      Storage._instance = new Storage();
    }
    return Storage._instance!;
  }
  constructor() {
    this.bucket = getStorage(firebaseApp);
  }

  getDownloadURL = async (path: string) => {
    return await getDownloadURL(ref(this.bucket, path));
  };
}
