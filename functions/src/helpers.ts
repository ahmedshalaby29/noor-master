import { load as loadHtml } from "cheerio";
import { extractRoleId, hiddenInputs } from "./utils";


export async function extractHomeData(data: string) {
  try {
    const $ = loadHtml(data);

    const userName = $(".username").text();

    const allAccounts = $("div.userinfo ul.menu.TopUsers a")
      .map((_, e) => ({
        text: $(e).text(),
        id: extractRoleId($(e).attr("onclick")!),
      }))
      .toArray() as any as { text: string; id: string }[];

    const currentAccount = $("div.userinfo div.hidden_user_info span").text();
    const weirdData = hiddenInputs($);

    const navigation = await mainNavigation(data);

    return {
      userName,
      allAccounts,
      currentAccount,
      weirdData,
      navigation,
    };
  } catch (e) {
    console.error(e);
    throw Error("unable to extract the user imformation ");
  }
}

//return
async function mainNavigation(data: string) {
  const $ = loadHtml(data);
  const menu = $("#tab-1 ul.menu")

  console.log("title: " + $("title").text());
  
  const result = $("a", menu)
    .map((_, e) => ({
      text: $(e).text(),
      id: extractRoleId($(e).attr("onclick")!),
    }))
    .toArray() as any as { text: string; id: string }[];
   return result;  
}

export function checkValidity(data: string) {
  const $ = loadHtml(data);

  const span = $("span.ValidationClass");

  if (
    span.length &&
    span.text().includes("لا يوجد لديك صلاحيات لإدخال المهارات")
  ) {
    return false;
  }

  return true;
}
