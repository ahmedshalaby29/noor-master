import http from "axios";
import { firestore } from "firebase-admin";
import { stringify as QueryEncode } from "querystring";
import { auth, db, LOGIN_ENDPOINT } from "../../common";
import * as express from "express";
import { User } from "firebase/auth";
import { Request, Response } from "express";

import { mergeCookies } from "../../utils";
const cry = require("crypto-js");

const iv = cry.enc.Utf8.parse("1052099214050902");
const key = cry.enc.Utf8.parse("p10zpop213tpDW41");
const router = express.Router();

router.post("/", async (req: Request, res: Response) => {
    const data = req.body.data;
    const user: User = req.body.user;
    if (user?.uid)
   console.warn(
     `authenicated user ${user?.uid} is using login captcha checking!`
   );

 const encr = (x: any) =>
   cry.AES.encrypt(x, key, {
     iv,
     keySize: 16,
     mode: cry.mode.CBC,
     padding: cry.pad.Pkcs7,
   }).toString();

 const {
   __VIEWSTATEGENERATOR,
   __VIEWSTATEENCRYPTED,
   __EVENTVALIDATION,
   __VIEWSTATE,
   cookies: OldCookies,
 } = data;
 const { name, password, captcha } = data;

 if (checkInputs(data)) {
   const postData = {
     __LASTFOCUS: "",
     __EVENTTARGET: "",
     __EVENTARGUMENT: "",
     __VIEWSTATE,
     __VIEWSTATEENCRYPTED,
     __EVENTVALIDATION,
     __VIEWSTATEGENERATOR,
     hdnLanguage: 1,
     bMtSMB1: "تسجيل الدخول",
     tMbPAN1: name,
     tMbPAR1: encr(password),
     tMbPAG1: captcha,
   };

   try {
     await http.post(LOGIN_ENDPOINT, QueryEncode(postData), {
       headers: {
         "Content-Type": "application/x-www-form-urlencoded",
         Referer: LOGIN_ENDPOINT,
         "User-Agent":
           "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
         Cookie: OldCookies.join("; "),
       },
       maxRedirects: 0,
     });
   } catch (e: any) {
     if (e.response && e.response.status == 302) {
       const cookies = mergeCookies(
         OldCookies,
         e.response.headers["set-cookie"]
       );

       if (!(cookies instanceof Array) || !cookies.length) {
         console.error("success login without returning cookies", e.response);
         res.json({ operation: "failed" }).status(500);
       }

       try {
         await auth.getUserByEmail(name + "@noor.com");
         try {
           await db.collection("cookies").doc(name).delete();
         } catch (e) {}
       } catch (e) {
         await db
           .collection("cookies")
           .doc(name)
           .set({
             cookies,
             password,
             expires: firestore.Timestamp.fromMillis(
               Date.now() + 1000 * 60 * 60
             ),
           });
       }

       res.json({operation: "success", data: cookies }).status(200);
     }
   }
 } else {
 }

 res.json( { operation: "failed" }).status(500);
})



function checkInputs(inputs: {
  __VIEWSTATEGENERATOR: string;
  __VIEWSTATEENCRYPTED: string;
  __EVENTVALIDATION: string;
  __VIEWSTATE: string;
  cookies: string[];
  name: string;
  password: string;
  captcha: number;
}) {
  if (!(inputs.cookies instanceof Array) || inputs.cookies.length < 2) {
    return false;
  }
  if (inputs.name.length < 4) {
    return false;
  }
  if (inputs.password.length < 4) {
    return false;
  }
  if (inputs.captcha.toString().length != 4) {
    return false;
  }
  return true;
}
