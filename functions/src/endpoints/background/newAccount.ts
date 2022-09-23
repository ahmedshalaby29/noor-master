import * as functions from "firebase-functions";
import * as fs from "fs";
import { auth, db, storage } from "../../common";
import Redirect from "../../core/redirect";
import { extractHomeData } from "../../helpers";

const path = require("path");
const os = require("os");

export default functions
  .region("asia-south1")
  .auth.user()
  .onCreate(async (user) => {
    if (!user.email) {
      console.error("new user without email", user);
      return;
    }

    const name = user.email.split("@")[0];

    try {
      const cookieDoc = await db.collection("cookies").doc(name).get();
      const docData = cookieDoc.data();
      const cookies = docData.cookies as string[];
      const password = docData.password as string;
      const homePage = await Redirect.start({ cookies });

      const homedata = (await extractHomeData(homePage.stop().html))!;

      const tempFilePath = path.join(os.tmpdir(), user.uid + ".html");

      fs.writeFileSync(tempFilePath, homePage.stop().html);
      await storage.upload(tempFilePath);

      const { userName, allAccounts, currentAccount } = homedata;
      const { weirdData } = homedata;

      if (!userName) {
        console.error("unable to extract userName for ", user);
        await auth.deleteUser(user.uid);
        return;
      }

      await auth.updateUser(user.uid, {
        displayName: userName,
      });

      const config = (await db.doc("/config/default").get()).data();
      const tryDays = config?.try ?? 3;

      await auth.setCustomUserClaims(user.uid, {
        try: Date.now() + tryDays * 24 * 3600 * 1000,
      });

      await db
        .collection("users")
        .doc(user.uid)
        .set({
          name: userName,
          username: name,
          password,
          try: Date.now() + tryDays * 24 * 3600 * 1000,
          role: [...allAccounts.map((e) => e.text), currentAccount],
          currentRole: currentAccount,
          weirdData,
        });
    } catch (e) {
      console.error("user created without a cookie collection", user, e);
    }
  });
