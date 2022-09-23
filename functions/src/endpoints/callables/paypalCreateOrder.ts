import * as functions from "firebase-functions";

import * as Paypal from "@paypal/checkout-server-sdk";
import { db, isBlocked } from "../../common";
import { Config } from "../../types";

const clientId =
  "AV4gQ-jSryV-9cAV5Sgkl1HP0xcuybQ4Zds1L9Whez5jZsRFrpswaWVyOGa5xtlDpyVywgHoiS9LtaSM";
const secretKey =
  "EAjBYmutOwSoI97fN2hVU6v5ZIEMIqK4KZAC-7d6HeK4of4vYoJh6QeVW1Wa_8oYuC4RFaeEkTYhtU7b";

const env = new Paypal.core.SandboxEnvironment(clientId, secretKey);
const client = new Paypal.core.PayPalHttpClient(env);

export default functions
  .region("asia-south1")
  .https.onCall(async (data, context) => {
    if (await isBlocked(context, true)) return;

    let request = new Paypal.orders.OrdersCreateRequest();
    const config = (await db.doc("config/default").get()).data() as Config;

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
