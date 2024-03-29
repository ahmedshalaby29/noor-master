import { load } from "cheerio";
import { isBlocked } from "../../../common";
import Form from "../../../core/form";
import Redirect from "../../../core/redirect";
import { extractHomeData } from "../../../helpers";
import { IncrementalData } from "../../../types";
import { extractRoleIds } from "../../../utils";
import { Request, Response } from "express";
import * as express from "express";
import { User } from "firebase-auth";

interface NavigationData extends IncrementalData {
  account: string;
  nav1: string;
  nav2: string;
}
export const router = express.Router();
router.post("/navigation", async (req: Request, res: Response) => {
  try {
    const data: NavigationData = req.body.data;
    const user: User = req.body.user;
    if (await isBlocked(user)) return null;
    //returns Redirect data instance
    const homePage = await Redirect.start({
      from:
        data.from ??
        "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
      cookies: data.cookies,
    });

    const { secondNav, form } = await navigateToForm(homePage, data);

    res.json(secondNav.sendForm(form)).status(200);
  } catch (error) {
    console.log(error.error);
    res.status(500);
  }
});

export async function navigateToForm(homePage: Redirect, data: NavigationData) {
  const checkAccount = await homePage.nextIf(
    async (config) => {
      if (!data.account) return false;
      const home = await extractHomeData(config.html);

      return !home.currentAccount.includes(data.account);
    },
    async (config) => {
      const home = await extractHomeData(config.html);

      const accountId = home.allAccounts.find(
        (e) => e.text == data.account
      )!.id;

      return {
        target: "SwitchUserTypeMenu",
        to: accountId,
        weirdData: home.weirdData,
      };
    }
  );
  const ensurecheckAccount = await checkAccount.nextIf(
    async (config) => {
      if (!data.account) return false;
      const home = await extractHomeData(config.html);

      return !home.currentAccount.includes(data.account);
    },
    async (config) => {
      const home = await extractHomeData(config.html);

      //#endregion
      const accountId = home.allAccounts.find(
        (e) => e.text == data.account
      )!.id;

      return {
        target: "SwitchUserTypeMenu",
        to: accountId,
        weirdData: home.weirdData,
      };
    }
  );

  const firstNav = await ensurecheckAccount.next(async (config) => {
    const home = await extractHomeData(config.html);

    const nav1Id = home.navigation.find((e) => e.text == data.nav1)
      ? home.navigation.find((e) => e.text == data.nav1).id
      : "";

    console.log("##### YAYYYY first step1s!");
    return {
      target: "MenuItemRedirect",
      to: nav1Id,
      weirdData: home.weirdData,
    };
  });

  const ensureFirstNav = await firstNav.nextIf(
    async (config) => {
      //  const nav2Ids = await innerNavigation(config.html);
      return checkPageTitle(config.html);
    },
    async (config) => {
      const home = await extractHomeData(config.html);
      console.log(
        "106 data.nav1 " + data.nav1 + "home.navigation " + home.navigation
      );
      const nav1Id = home.navigation.find((e) => e.text == data.nav1)!.id;

      console.log("##### YAYYYY [FORCED] first step!");
      return {
        target: "MenuItemRedirect",
        to: nav1Id,
        weirdData: home.weirdData,
      };
    }
  );

  const secondNav = await ensureFirstNav.next(async (config) => {
    const nav2Ids = await innerNavigation(config.html);
    console.log("121 nav2Ids " + nav2Ids + "data.nav2 " + data.nav2);
    const nav2Id = nav2Ids.find((e) => e.text == data.nav2)?.id ?? [];

    console.log("##### YAYYYY second step!");

    return {
      to: nav2Id.join(","),
      target: "OperationOnMenu",
    };
  });

  const { html } = secondNav.stop();
  const form = new Form(html);
  return { secondNav, form };
}

async function innerNavigation(data: string) {
  const $ = load(data);

  return $("div.main_ul_links a")
    .map((_, e) => ({
      text: $(e).text(),
      id: extractRoleIds($(e).attr("onclick")!),
    }))
    .toArray() as any as { text: string; id: string[] }[];
}

async function checkPageTitle(data: string) {
  const $ = load(data);
  const titleText = $("title").text();

  console.log("titleText: " + titleText.trim());
  return titleText.trim() == "EduWave - الخدمة غير متوفرة :: نظام نور";
}
