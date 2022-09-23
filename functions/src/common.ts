import * as admin from "firebase-admin";
import { https } from "firebase-functions";

import { PubSub } from "@google-cloud/pubsub";

const pubsub = new PubSub();

export const FailedRequest = pubsub.topic("failed_requests");


const app = admin.initializeApp();

export const db = app.firestore();

export const storage = app.storage().bucket();

db.settings({
  ignoreUndefinedProperties: true,
});
export const auth = app.auth();

export const LOGIN_ENDPOINT = "https://noor.moe.gov.sa/Noor/login.aspx";

export async function isBlocked(
  context: https.CallableContext,
  isFree = false
) {
  if (!context.auth) return true;
  if (isFree) return false;

  const user = await auth.getUser(context.auth.uid);

  const tryPeriod = parseInt(user.customClaims.try);

  if (tryPeriod > Date.now()) {
    return false;
  } else {
    console.warn("unauthorised request from" + context.auth.uid);
    return true;
  }
}
