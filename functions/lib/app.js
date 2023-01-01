"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
var cors = require('cors');
const path = require('path');
const fs = require('fs');
const https = require('https');
const save_1 = require("./endpoints/callables/incremental/editSkill/save");
const submit_1 = require("./endpoints/callables/incremental/editSkill/submit");
const signForm_1 = require("./endpoints/callables/signForm");
const postSignForm_1 = require("./endpoints/callables/postSignForm");
const newAccount_1 = require("./endpoints/callables/newAccount");
const navigation_1 = require("./endpoints/callables/incremental/navigation");
const formOptions_1 = require("./endpoints/callables/incremental/formOptions");
const save_2 = require("./endpoints/callables/incremental/saveDegree/save");
const submit_2 = require("./endpoints/callables/incremental/saveDegree/submit");
const examReport_1 = require("./endpoints/callables/incremental/saveReport/examReport");
const skillReport_1 = require("./endpoints/callables/incremental/saveReport/skillReport");
const saveAll_1 = require("./endpoints/background/saveAll");
const app = express();
const port = 5000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(save_1.router)
    .use(signForm_1.router)
    .use(postSignForm_1.router)
    .use(newAccount_1.router)
    .use(navigation_1.router)
    .use(formOptions_1.router)
    .use(submit_1.router)
    .use(save_2.router)
    .use(submit_2.router)
    .use(examReport_1.router)
    .use(skillReport_1.router)
    .use(saveAll_1.router);
app.get("/", (req, res) => {
    res.send("Express + TypeScript Server");
});
const sslServer = https.createServer({
    key: fs.readFileSync(path.join('C:\\noor-master\\functions', 'cert', 'private.pem')),
    cert: fs.readFileSync(path.join('C:\\noor-master\\functions', 'cert', 'certificate.pem')),
}, app);
sslServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
//# sourceMappingURL=app.js.map