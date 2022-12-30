"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const Paypal = require("@paypal/checkout-server-sdk");
const common_1 = require("../../common");
const clientId = "AV4gQ-jSryV-9cAV5Sgkl1HP0xcuybQ4Zds1L9Whez5jZsRFrpswaWVyOGa5xtlDpyVywgHoiS9LtaSM";
const secretKey = "EAjBYmutOwSoI97fN2hVU6v5ZIEMIqK4KZAC-7d6HeK4of4vYoJh6QeVW1Wa_8oYuC4RFaeEkTYhtU7b";
const env = new Paypal.core.SandboxEnvironment(clientId, secretKey);
const client = new Paypal.core.PayPalHttpClient(env);
exports.default = functions
    .region("asia-south1")
    .https.onCall(async (data, context) => {
    let request = new Paypal.orders.OrdersCreateRequest();
    const config = (await common_1.db.doc("config/default").get()).data();
    if (!config.prices || !config.prices.some((e) => e.price == data.price))
        return;
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: data.price,
                },
            },
        ],
    });
    const response = await client.execute(request);
    return response.result;
});
//# sourceMappingURL=paypalCreateOrder.js.map