"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const axios_1 = require("axios");
const fs = require("fs");
const common_1 = require("../../common");
const redirect_1 = require("../../core/redirect");
const helpers_1 = require("../../helpers");
const path = require("path");
const os = require("os");
const common_2 = require("../../common");
exports.default = functions
    .region("asia-south1")
    .auth.user()
    .onCreate(async (user) => {
    var _a;
    if (!user.email) {
        console.error("new user without email", user);
        return;
    }
    if (process.env.FUNCTIONS_EMULATOR === 'true') {
        const name = user.email.split("@")[0];
        try {
            const cookieDoc = await common_1.db.collection("cookies").doc(name).get();
            const docData = cookieDoc.data();
            const cookies = docData.cookies;
            const password = docData.password;
            const homePage = await redirect_1.default.start({ cookies });
            const homedata = (await (0, helpers_1.extractHomeData)(homePage.stop().html));
            const tempFilePath = path.join(os.tmpdir(), user.uid + ".html");
            fs.writeFileSync(tempFilePath, homePage.stop().html);
            await common_1.storage.upload(tempFilePath);
            const { userName, allAccounts, currentAccount } = homedata;
            const { weirdData } = homedata;
            if (!userName) {
                console.error("unable to extract userName for ", user);
                await common_1.auth.deleteUser(user.uid);
                return;
            }
            await common_1.auth.updateUser(user.uid, {
                displayName: userName,
            });
            const config = (await common_1.db.doc("/config/default").get()).data();
            const tryDays = (_a = config === null || config === void 0 ? void 0 : config.try) !== null && _a !== void 0 ? _a : 3;
            await common_1.auth.setCustomUserClaims(user.uid, {
                try: Date.now() + tryDays * 24 * 3600 * 1000,
            });
            await common_1.db
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
        }
        catch (e) {
            console.error("user created without a cookie collection", user, e);
        }
    }
    else {
        await axios_1.default.post(`${common_2.API_ENDPOINT}/newAccount`, user);
    }
});
//# sourceMappingURL=newAccount.js.map