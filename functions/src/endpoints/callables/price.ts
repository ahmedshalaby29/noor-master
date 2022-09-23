import * as functions from "firebase-functions";
import { db, isBlocked } from "../../common";
import { Config } from "../../types";

export default functions
  .region("asia-south1")
  .https.onCall(async (_, context) => {
    if (await isBlocked(context, true)) return null;

    const config = (await db.doc("/config/default").get()).data() as Config;

    if (config.prices) {
      return config.prices;
    } else return [];
  });
