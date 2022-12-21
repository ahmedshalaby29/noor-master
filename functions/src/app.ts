import { Request, Response, Express } from "express";
import * as express from "express";
var cors = require('cors')
const path = require('path')
const fs = require('fs')
const https = require('https')

import {router as saveSkill} from './endpoints/callables/incremental/editSkill/save'
import {router as submitSkill} from './endpoints/callables/incremental/editSkill/submit'

import {router as signForm} from './endpoints/callables/signForm'
import {router as postSignForm} from './endpoints/callables/postSignForm'
import {router as newAccount} from './endpoints/callables/newAccount'
import {router as navigation} from './endpoints/callables/incremental/navigation'
import {router as formOptions} from './endpoints/callables/incremental/formOptions'
import {router as saveDegree} from './endpoints/callables/incremental/saveDegree/save'
import {router as submitDegree} from './endpoints/callables/incremental/saveDegree/submit'

import {router as examReport} from './endpoints/callables/incremental/saveReport/examReport'
import {router as skillReport} from './endpoints/callables/incremental/saveReport/skillReport'
import {router as saveAll} from './endpoints/background/saveAll'


const app: Express = express();

const port = 5000;
app.use(cors())
app.use(express.json({limit: '50mb'}));

app.use(saveSkill)
.use(signForm)
.use(postSignForm)
.use(newAccount)
.use(navigation)
.use(formOptions)
.use(submitSkill)
.use(saveDegree)
.use(submitDegree)
.use(examReport)
.use(skillReport)
.use(saveAll)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

const sslServer = https.createServer({
  key: fs.readFileSync(path.join('C:\\noor-master\\functions','cert','private.pem')),
  cert: fs.readFileSync(path.join('C:\\noor-master\\functions','cert','certificate.pem')),
},app)

sslServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

