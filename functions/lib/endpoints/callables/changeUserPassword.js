"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const common_1 = require("../../common");
exports.default = functions
    .region("asia-south1")
    .https.onCall(async (data, context) => {
    const email = data.email;
    const password = data.password;
    console.log(data);
    console.log(email);
    console.log(password);
    const uid = (await common_1.auth.getUserByEmail(email)).uid;
    await common_1.db.collection("users").doc(uid).update({
        password: password,
    });
    const newUserRecord = await common_1.auth.updateUser(uid, {
        email: email,
        emailVerified: true,
        password: password,
    });
    return { email: newUserRecord.email,
        newPassword: password };
});
//# sourceMappingURL=changeUserPassword.js.map