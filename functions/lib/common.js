"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBlocked = exports.API_ENDPOINT = exports.LOGIN_ENDPOINT = exports.auth = exports.storage = exports.db = exports.FailedRequest = void 0;
const admin = require("firebase-admin");
const pubsub_1 = require("@google-cloud/pubsub");
const pubsub = new pubsub_1.PubSub();
exports.FailedRequest = pubsub.topic("failed_requests");
var serviceAccount = require("../formal-ember-345513-firebase-adminsdk-7gyx7-d05bbf31c8.json");
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "formal-ember-345513.appspot.com",
});
exports.db = app.firestore();
exports.storage = app.storage().bucket();
exports.db.settings({
    ignoreUndefinedProperties: true,
});
exports.auth = app.auth();
exports.LOGIN_ENDPOINT = "https://noor.moe.gov.sa/Noor/login.aspx";
exports.API_ENDPOINT = "http://localhost:5000";
async function isBlocked(user, isFree = false) {
    if (!user)
        return true;
    if (isFree)
        return false;
    const userData = await exports.auth.getUser(user.uid);
    const tryPeriod = parseInt(userData.customClaims.try);
    if (tryPeriod > Date.now()) {
        return false;
    }
    else {
        console.warn("unauthorised request from " + user.uid);
        console.warn("user tryPeriod: " + tryPeriod);
        return true;
    }
}
exports.isBlocked = isBlocked;
//# sourceMappingURL=common.js.map