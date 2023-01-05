import http from "axios";
import { load as loadHtml } from "cheerio";
import { LOGIN_ENDPOINT } from "../../common";
import { hiddenInputs } from "../../utils";
import { Request, Response } from "express";
import * as express from "express";
export const router = express.Router();

router.post("/signForm", async (req: Request, res: Response) => {
  const response = await http.get(LOGIN_ENDPOINT, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
      Referer: "https://noor.moe.gov.sa/Noor/logout.aspx",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    },
  });

  const cookies = response.headers["set-cookie"] || [];
  const html = response.data;

  const $ = loadHtml(html);
  const key = $('#bMtSMB1').attr("onclick").split('\'')[11];
  const captachUrl =
    "https://noor.moe.gov.sa/Noor/" + $("#img_Captcha").attr("src");

  const { data } = await http.get(captachUrl, {
    headers: {
      Cookie: cookies.join("; "),
      Accept:
        "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: LOGIN_ENDPOINT,
    },
    responseType: "arraybuffer",
  });

  const captcha = Buffer.from(data, "binary").toString("base64");

  const params = hiddenInputs($);

  res.json({
    captcha,
    ...params,
    cookies,
    key
  });
});
