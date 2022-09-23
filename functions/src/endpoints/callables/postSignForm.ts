import http from "axios";
import { firestore } from "firebase-admin";
import * as functions from "firebase-functions";
import { stringify as QueryEncode } from "querystring";
import { auth, db, LOGIN_ENDPOINT } from "../../common";
import { mergeCookies } from "../../utils";
const cry = require("crypto-js");


const iv = cry.enc.Utf8.parse("1052099214050902");
const key = cry.enc.Utf8.parse("p10zpop213tpDW41");

export default functions
  .region("asia-south1")
  .https.onCall(async (data, context) => {
    if (context.auth?.uid)
      console.warn(
        `authenicated user ${context.auth?.uid} is using login captcha checking!`
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
            console.error(
              "success login without returning cookies",
              e.response
            );
            return { operation: "failed" };
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

          return { operation: "success", data: cookies };
        }
      }
    } else {
    }

    return { operation: "failed" };
  });

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
