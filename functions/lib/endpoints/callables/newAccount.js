"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const fs = require("fs");
const common_1 = require("../../common");
const redirect_1 = require("../../core/redirect");
const helpers_1 = require("../../helpers");
const express = require("express");
const path = require("path");
const os = require("os");
exports.router = express.Router();
exports.router.post("/newAccount", async (req, res) => {
    const userData = req.body.data;
    console.log(userData);
    common_1.auth.createUser({
        email: userData.email,
        password: userData.password,
    })
        .then(async (userRecord) => {
        var _a;
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
        const name = userData.email.split("@")[0];
        try {
            const cookieDoc = await common_1.db.collection("cookies").doc(name).get();
            const docData = cookieDoc.data();
            const cookies = docData.cookies;
            const password = docData.password;
            const homePage = await redirect_1.default.start({ cookies });
            const homedata = (await (0, helpers_1.extractHomeData)(homePage.stop().html));
            const tempFilePath = path.join(os.tmpdir(), userRecord.uid + ".html");
            fs.writeFileSync(tempFilePath, homePage.stop().html);
            await common_1.storage.upload(tempFilePath);
            const { userName, allAccounts, currentAccount } = homedata;
            const { weirdData } = homedata;
            if (!userName) {
                console.error("unable to extract userName for ", userRecord);
                await common_1.auth.deleteUser(userRecord.uid);
                return;
            }
            await common_1.auth.updateUser(userRecord.uid, {
                displayName: userName,
            });
            const config = (await common_1.db.doc("/config/default").get()).data();
            const tryDays = (_a = config === null || config === void 0 ? void 0 : config.try) !== null && _a !== void 0 ? _a : 3;
            await common_1.auth.setCustomUserClaims(userRecord.uid, {
                try: Date.now() + tryDays * 24 * 3600 * 1000,
            });
            await common_1.db
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
            res.json({ operation: 'succeeded' });
        }
        catch (e) {
            console.error("user created without a cookie collection", userRecord, e);
        }
    })
        .catch((error) => {
        console.log('Error creating new user:', error);
    });
});
//# sourceMappingURL=newAccount.js.map