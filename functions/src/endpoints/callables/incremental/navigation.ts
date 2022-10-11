import { load } from "cheerio";
import * as functions from "firebase-functions";
import { isBlocked } from "../../../common";
import Form from "../../../core/form";
import Redirect from "../../../core/redirect";
import { extractHomeData } from "../../../helpers";
import { IncrementalData } from "../../../types";
import { extractRoleIds } from "../../../utils";
import util = require("util");

interface NavigationData extends IncrementalData {
  account: string;
  nav1: string;
  nav2: string;
}

export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;
    //returns Redirect data instance
    const homePage = await Redirect.start({
      from:
        data.from ??
        "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
      cookies: data.cookies,
    });

    const { secondNav, form } = await navigateToForm(homePage, data);

    return secondNav.sendForm(form);
  });

export async function navigateToForm(homePage: Redirect, data: NavigationData) {
  const checkAccount = await homePage.nextIf(
    async (config) => {
      if (!data.account) return false;
      const home = await extractHomeData(config.html);
      //#region logs
      console.log("home.currentAccount: " + home.currentAccount);
      console.log("home.allAccounts: " + home.allAccounts);
      console.log("data.account " + data.account);
      console.log(
        "!home.currentAccount.includes(data.account): " +
          home.currentAccount.includes(data.account)
      );
      //#endregion
      return !home.currentAccount.includes(data.account);
    },
    async (config) => {
      const home = await extractHomeData(config.html);
      //#region logs
      console.log(
        "49 data.account " +
          data.account +
          "home.allAccounts " +
          home.allAccounts
      );
      console.log(
        util.inspect(home.allAccounts, {
          showHidden: false,
          depth: null,
          colors: true,
        })
      );
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
  const ensurecheckAccount = await checkAccount.nextIf(
    async (config) => {
      if (!data.account) return false;
      const home = await extractHomeData(config.html);
      //#region logs
      console.log("home.currentAccount: " + home.currentAccount);
      console.log("home.allAccounts: " + home.allAccounts);
      console.log("data.account " + data.account);
      console.log(
        "!home.currentAccount.includes(data.account): " +
          home.currentAccount.includes(data.account)
      );
      //#endregion
      return !home.currentAccount.includes(data.account);
    },
    async (config) => {
      const home = await extractHomeData(config.html);
      console.log("Ensuring check account!");
      //#region logs
      console.log(
        "49 data.account " +
          data.account +
          "home.allAccounts " +
          home.allAccounts
      );
      console.log(
        util.inspect(home.allAccounts, {
          showHidden: false,
          depth: null,
          colors: true,
        })
      );
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
    //#region logs

    console.log(
      "77 data.nav1 " + data.nav1 + "home.navigation " + home.navigation
    );
    console.log(
      util.inspect(home.navigation, {
        showHidden: false,
        depth: null,
        colors: true,
      })
    );
    //#endregion

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
