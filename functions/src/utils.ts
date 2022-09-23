import * as Str from "@supercharge/strings";
import { weird } from "./types";

export const randomString = (size: number = 16) => {
  return Str.random(size);
};

export function extractRoleId(str: string) {
  const right = str.split("','").pop() as string;
  const [left] = right.split("'");

  return left;
}

export function mergeNodeTexts(nodes: cheerio.Cheerio, root: cheerio.Root) {
  return nodes
    .map((_, s) => root(s).text())
    .toArray()
    .reduce((acc, e) => `${acc} ${e}`, "") as string;
}
export function extractRoleIds(str: string) {
  const right = str.split("(").pop() as string;
  const [left] = right.split(")");

  return left.split(",").map((e) => e.replace(/'/g, ""));
}

export function hiddenInputs($: cheerio.Root) {
  const hiddens = $("input[type='hidden']");
  let params = {} as any;
  hiddens.map((_, e) => {
    const elm = e as any;
    params[elm.attribs.name] = elm.attribs.value;
  });

  return params as weird;
}

export function defaultHeader(cookies: string[]) {
  return {
    "User-Agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36",
    Cookie: mergeCookies(cookies).join("; "),
  };
}

export function pageNameBase64(url: string) {
  return Buffer.from(url.split("/").pop()!.split(".")[0]!).toString("base64");
}

export function mergeCookies(...cookies: string[][]) {
  const items = cookies
    .filter((e) => e)
    .map((e) =>
      e
        .filter((e) => e)
        .map((c) => c.split(";"))
        .flat()
        .map((e) => e.trim())
    )
    .flat();

  const ob = items.reduce(
    (acc, v) => ({
      ...acc,
      [v.split("=")[0]]: v.split("=")[1],
    }),
    {}
  );

  return Object.entries(ob).reduce((acc, v) => {
    if (!v[1]) return acc;
    return [...acc, `${v[0]}=${v[1]}`];
  }, []);
}

export function replaceNullValues(ob: { [key: string]: any }, repalce: any) {
  Object.keys(ob).forEach(
    (k) =>
      (ob[k] =
        ob[k] == null || ob[k] == "null" || ob[k] == "undefined"
          ? repalce
          : ob[k])
  );
  return ob;
}

export function escapeQuotes(str?: string) {
  return (str ?? "").replace(/"/g, '\\"').replace(/'/g, "\\'");
}

export function clone<T>(ob: T) {
  if (ob) return JSON.parse(JSON.stringify(ob)) as T;
  return undefined;
}

export function randomDelay(max: number, min: number = 0) {
  const rand = Math.floor(Math.random() * max) + min;
  return new Promise((res) => {
    setTimeout(res, rand);
  });
}

export async function retryFailedRequests<T>(
  fc: () => Promise<T>,
  max: number = 3
) {
  let result: T;
  let error;
  for (let i = 0; i < max; i++) {
    try {
      result = await fc();
      return result;
    } catch (e) {
      error = e;
      console.log("Trying aging #", i);
      await randomDelay(1000 * i)
    }
  }

  if (result == null) {
    throw new Error(error);
  }
  return result;
}
