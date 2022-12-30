import * as admin from "firebase-admin";

import { PubSub } from "@google-cloud/pubsub";
import { User } from "firebase-auth";

const pubsub = new PubSub();

export const FailedRequest = pubsub.topic("failed_requests");
var serviceAccount = require("../formal-ember-345513-firebase-adminsdk-7gyx7-d05bbf31c8.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "formal-ember-345513.appspot.com",
});

export const db = app.firestore();

export const storage = app.storage().bucket();

db.settings({
  ignoreUndefinedProperties: true,
});
export const auth = app.auth();

export const LOGIN_ENDPOINT = "https://noor.moe.gov.sa/Noor/login.aspx";
export const API_ENDPOINT = "http://localhost:5000";

export async function isBlocked(user: User, isFree = false) {
  if (!user) return true;
  if (isFree) return false;

  const userData = await auth.getUser(user.uid);

  const tryPeriod = parseInt(userData.customClaims.try);

  if (tryPeriod > Date.now()) {
    return false;
  } else {
    console.warn("unauthorised request from " + user.uid);
    console.warn("user tryPeriod: " + tryPeriod);

    return true;
  }
}
