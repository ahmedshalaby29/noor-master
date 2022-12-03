import { Request, Response, Express } from "express";
import * as express from "express";
import {router as saveSkill} from './endpoints/callables/incremental/editSkill/save'
import {router as signForm} from './endpoints/callables/signForm'
import {router as postSignForm} from './endpoints/callables/postSignForm'
import {router as newAccount} from './endpoints/callables/newAccount'
import {router as navigation} from './endpoints/callables/incremental/navigation'
import {router as formOptions} from './endpoints/callables/incremental/formOptions'



const app: Express = express();

const port = 5000;


app.use(express.json())

app.use(saveSkill).use(signForm).use(postSignForm).use(newAccount).use(navigation).use(formOptions)

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
