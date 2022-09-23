import { load } from "cheerio";
import * as functions from "firebase-functions";
import { isBlocked } from "../../../common";
import Form from "../../../core/form";
import Redirect from "../../../core/redirect";
import { extractHomeData } from "../../../helpers";
import { IncrementalData } from "../../../types";
import { extractRoleIds } from "../../../utils";

interface NavigationData extends IncrementalData {
  account: string;
  nav1: string;
  nav2: string;
}

export default functions
  .region("asia-south1")
  .https.onCall(async (data: NavigationData, context) => {
    if (await isBlocked(context)) return null;

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
      console.log(home.currentAccount);
      console.log(home.allAccounts);
      console.log(home.currentAccount == data.account);
      return home.currentAccount.trim() != data.account.trim();
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

  const firstNav = await checkAccount.next(async (config) => {
    const home = await extractHomeData(config.html);
    const nav1Id = home.navigation.find((e) => e.text == data.nav1)!.id;

    console.log("##### YAYYYY first step1s!");
    return {
      target: "MenuItemRedirect",
      to: nav1Id,
      weirdData: home.weirdData,
    };
  });

  const ensureFirstNav = await firstNav.nextIf(
    async (config) => {
      const nav2Ids = await innerNavigation(config.html);
      return nav2Ids.length == 0;
    },
    async (config) => {
      const home = await extractHomeData(config.html);
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
    console.log(nav2Ids);
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
