import * as functions from "firebase-functions";
import { auth, db } from "../../common";

export default functions
  .region("asia-south1")
  .https.onCall(async (data, context) => {
    const email = data.email;
    const password = data.password;
    console.log(data)
    console.log(email)
    console.log(password)
    const uid = (await auth.getUserByEmail(email)).uid;

    await db.collection("users").doc(uid).update({
      password: password,
    });

    const newUserRecord = await auth.updateUser(uid, {
      email: email,
      emailVerified: true,
      password: password,
    });
    return { email: newUserRecord.email,
         newPassword: password };
  });
