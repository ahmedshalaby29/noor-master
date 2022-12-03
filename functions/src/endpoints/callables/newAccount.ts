import * as fs from "fs";
import { auth, db, storage } from "../../common";
import Redirect from "../../core/redirect";
import { extractHomeData } from "../../helpers";
import { Request, Response } from "express";
import * as express from "express";

const path = require("path");
const os = require("os");

export const router = express.Router();


router.post("/newAccount", async (req: Request, res: Response) => {
  const userData = req.body.data;
  console.log(userData)
  auth.createUser({
    email: userData.email,
    password: userData.password,
  })
  .then(async (userRecord) => {
    // See the UserRecord reference doc for the contents of userRecord.
    console.log('Successfully created new user:', userRecord.uid);
    const name = userData.email.split("@")[0];
    try {
      const cookieDoc = await db.collection("cookies").doc(name).get();
      const docData = cookieDoc.data();
      const cookies = docData.cookies as string[];
      const password = docData.password as string;
      const homePage = await Redirect.start({ cookies });
    
      const homedata = (await extractHomeData(homePage.stop().html))!;
    
      const tempFilePath = path.join(os.tmpdir(), userRecord.uid + ".html");
    
      fs.writeFileSync(tempFilePath, homePage.stop().html);
      await storage.upload(tempFilePath);
    
      const { userName, allAccounts, currentAccount } = homedata;
      const { weirdData } = homedata;
    
      if (!userName) {
        console.error("unable to extract userName for ", userRecord);
        await auth.deleteUser(userRecord.uid);
        return;
      }
    
      await auth.updateUser(userRecord.uid, {
        displayName: userName,
      });
    
      const config = (await db.doc("/config/default").get()).data();
      const tryDays = config?.try ?? 3;
    
      await auth.setCustomUserClaims(userRecord.uid, {
        try: Date.now() + tryDays * 24 * 3600 * 1000,
      });
    
      await db
        .collection("users")
        .doc(userRecord.uid)
        .set({
          name: userName,
          username: name,
          password,
          try: Date.now() + tryDays * 24 * 3600 * 1000,
          role: [...allAccounts.map((e) => e.text), currentAccount],
          currentRole: currentAccount,
          weirdData,
        });
        res.json({operation:'succeeded'})
    } catch (e) {
      console.error("user created without a cookie collection", userRecord, e);
    }

  })
  .catch((error) => {
    console.log('Error creating new user:', error);
  });


})
