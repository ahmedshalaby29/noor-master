"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const common_1 = require("../../common");
exports.default = functions
    .region("asia-south1")
    .https.onCall(async (_, context) => {
    const config = (await common_1.db.doc("/config/default").get()).data();
    if (config.prices) {
        return config.prices;
    }
    else
        return [];
});
//# sourceMappingURL=price.js.map