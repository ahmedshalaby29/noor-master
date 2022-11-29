import newAccount from "./endpoints/background/newAccount";
import saveAll from "./endpoints/background/saveAll";

import postSignForm from "./endpoints/callables/postSignForm";
import price from "./endpoints/callables/price";
import paypalCreateOrder from "./endpoints/callables/paypalCreateOrder";
import paypalHandleOrder from "./endpoints/callables/paypalHandleOrder";
import changeUserPassword from "./endpoints/callables/changeUserPassword";
import failedRequests from "./endpoints/background/failedRequests";

import { Request, Response, Express } from "express";
import * as express from "express";

const app: Express = express();

const port = 5000;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});

export {
  failedRequests,
  postSignForm,
  newAccount,
  saveAll,
  price,
  paypalCreateOrder,
  paypalHandleOrder,
  changeUserPassword,
};
