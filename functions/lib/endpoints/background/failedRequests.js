"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.excuteFailedRequest = void 0;
const axios_1 = require("axios");
async function excuteFailedRequest(data) {
    const { to, payload, headers } = data;
    for (let i = 0; i < 5; i++) {
        try {
            const data = await axios_1.default.post(to, payload, {
                headers,
            });
            console.log("status:", data.statusText, data.data.length > 5000);
            return;
        }
        catch (e) {
            console.log(e);
            console.log("Failed " + (i + 1));
        }
    }
}
exports.excuteFailedRequest = excuteFailedRequest;
//# sourceMappingURL=failedRequests.js.map