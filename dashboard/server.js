const fs = require("fs");
const os = require("os");
const path = require("path");
const { PubSub } = require("@google-cloud/pubsub");

const Express = require("express");
const app = Express();

app.use(Express.json({limit: '25mb'}));
app.use(Express.urlencoded({limit: '25mb'}));

app.use(Express.json());

const admin = require("firebase-admin");
const isDev = process.env.NODE_ENV == "development";
const firebaseConfig = isDev
  ? {
      credential: admin.credential.cert(require("./serviceAccount.json")),
    }
  : undefined;
const firebaseApp = admin.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
const auth = firebaseApp.auth();
const storage = firebaseApp
  .storage()
  .bucket("gs://formal-ember-345513.appspot.com");

var cors = require("cors");

const PORT = process.env.PORT || 5050;

app.use(cors());

app.use(Express.static("public"));

const API = Express.Router();

API.use(async (req, res, next) => {
  const redirect = () => res.redirect("https://orsodnour.com");
  const { auth: token } = req.headers;

  if (!token) return redirect();

  const user = await auth.verifyIdToken(token);
  if (!user.email_verified) return redirect();

  const isAllowed = !(
    await db
      .collection("config")
      .where("admin", "array-contains", user.email)
      .get()
  ).empty;

  if (isAllowed) return next();
  else return redirect();
});

app.use("/api", API);

function checkIsPro(trying) {
  return trying - Date.now() > 259200000;
}

API.get("/users", async (req, res) => {
  const userDocs = await db.collection("/users").get();

  const teachers = userDocs.docs.map((doc) => {
    const data = doc.data();

    return {
      created: doc.createTime.toDate(),
      id: doc.id,
      isPro: checkIsPro(data.try),
      name: data.name,
      uid: data.username,
      password: data.password ?? "------",
    };
  });

  res.json(teachers);
});

API.delete("/user/:id", async (req, res) => {
  const { id } = req.params;
  await auth.deleteUser(id);
  await db.collection("users").doc(id).delete();
  res.send("ok");
});

API.post("/free/:id", async (req, res) => {
  const free = 10000000;
  const { id } = req.params;
  await db.collection("users").doc(id).update({
    try: free,
  });

  await auth.setCustomUserClaims(id, {
    try: free,
  });

  res.send("ok");
});

API.post("/pro/:id", async (req, res) => {
  const config = (await db.doc("/config/default").get()).data();
  const tryDays = config?.prices[0]?.pro;

  const pro = Date.now() + tryDays * 24 * 3600 * 1000;
  const { id } = req.params;
  await db.collection("users").doc(id).update({
    try: pro,
  });

  await auth.setCustomUserClaims(id, {
    try: pro,
  });
  res.send("ok");
});

const prefix = "builder/";

API.get("/html", async (_, res) => {
  const [files] = await storage.getFiles({ prefix });
  const recent = files.pop();

  let [data] = await recent.download();
  data = data.toString();
  data = JSON.parse(data);

  return res.send(data);
});

const pubsub = new PubSub({
  projectId: firebaseApp.options.projectId,
});

API.post("/html", async (req, res) => {
  const topic = pubsub.topic("build_landing_page");

  console.log(req.body);
  const tempDir = os.tmpdir();
  const name = Date.now() + ".ikm";

  const p = path.join(tempDir, name);
  fs.writeFileSync(p, JSON.stringify(req.body));

  await storage.upload(p, {
    destination: path.join(prefix, name),
  });

  topic.publishMessage({
    data: Buffer.from("ftloikrm"),
  });

  res.send("done");
});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
