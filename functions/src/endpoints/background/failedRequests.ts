import * as functions from "firebase-functions";
import axios from "axios";

export default functions
  .region("asia-south1")
  .pubsub.topic("failed_requests")
  .onPublish(async (message) => {
    const { to, payload, headers } = message.json;

    for (let i = 0; i < 5; i++) {
      try {
        const data = await axios.post(to, payload, {
          headers,
        });
        console.log("status:", data.statusText, data.data.length > 5000);
        return;
      } catch (e) {
        console.log(e);
        console.log("Failed " + (i + 1));
      }
    }
  });
