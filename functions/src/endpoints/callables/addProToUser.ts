import { auth, db } from "../../common";
import * as functions from "firebase-functions";

export default functions.https.onRequest(async (req, res) => {
  const fromNow = Date.now() + 1000 * 3600 * 24 * req.body.numberOfDays;
  try {
    await db.doc(`users/${req.body.uid}`).update({
      try: fromNow,
    });

    await auth.setCustomUserClaims(req.body.uid, {
      try: fromNow,
    });
    res.send("Pro added to user with id " + req.body.uid);
  } catch (err) {
    console.log(`users/${req.body.uid}`);
    console.log(db);

    res.send(err);
  }
});
