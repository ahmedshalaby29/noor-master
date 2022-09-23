import http from "axios";
import { load as loadHtml } from "cheerio";
import * as FormData from "form-data";
import { stringify as QueryEncode } from "querystring";
import { IncrementalData, weird } from "../types";
import {
  defaultHeader,
  hiddenInputs,
  mergeCookies,
  pageNameBase64,
  replaceNullValues,
  retryFailedRequests,
} from "../utils";
import Form from "./form";

import axiosRetry from "axios-retry";

axiosRetry(http);

import { FailedRequest } from "../common"; // todo anti-pattern
type RedirectionType =
  | "MenuItemRedirect"
  | "OperationOnMenu"
  | "SwitchUserTypeMenu"
  | "";

interface RedirectionNavigationParams {
  to: string;
  target: RedirectionType;
  weirdData?: weird;
}

interface RedirectionInitParams {
  from?: string;
  cookies: string[];
}

interface RedirectionParams extends RedirectionNavigationParams {
  from: string;
  weirdData: weird;
  cookies: string[];
}

interface RedirectionResponse {
  html: string;
  weirdData: weird;
  redirected: string;
  prevCookies: string[];
}

export default class Redirect {
  private from: string;
  private to: string;
  private weirdData: weird;
  private cookies: string[];
  private prevCookies: string[];
  private target: RedirectionType;
  private redirected: string;
  private html: string;
  id: number;

  private create(config: RedirectionResponse) {
    const instance = new Redirect({
      ...this,
      ...config,
    });

    return instance;
  }

  clone() {
    return new Redirect({
      cookies: this.cookies,
      from: this.from,
      target: this.target,
      to: this.to,
      weirdData: {} as any,
      html: this.html,
      redirected: this.redirected,
      prevCookies: this.prevCookies,
    });
  }

  static async start(config: RedirectionInitParams) {
    const from =
      config.from ??
      "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx";

    const { data, headers } = await http.get(from, {
      headers: defaultHeader(config.cookies),
    });

    return new Redirect({
      cookies: config.cookies,
      from,
      target: "",
      to: "",
      weirdData: {} as any,
      html: data,
      redirected: "",
      prevCookies: headers["set-cookie"],
    });
  }

  static load(config: IncrementalData) {
    return new Redirect({
      cookies: config.cookies,
      from:
        config.from ??
        "https://noor.moe.gov.sa/Noor/EduWavek12Portal/HomePage.aspx",
      target: "",
      to: "",
      weirdData: config.weirdData,
      html: "",
      redirected: "",
      prevCookies: [],
    });
  }

  private constructor(config: RedirectionParams & RedirectionResponse) {
    console.log("new Instance ~~~~~~~~~~~~~~~~~~~~~~~~~~éé");
    this.from = config.from;
    this.cookies = config.cookies;

    this.target = config.target;
    this.to = config.to;

    this.weirdData = config.weirdData;
    this.html = config.html;
    this.redirected = config.redirected;
    this.prevCookies = config.prevCookies;
    this.id = Math.floor(Math.random() * 1000);
  }

  async nextIf(
    condition: (config: RedirectionResponse) => Promise<boolean>,
    treat: (config: RedirectionResponse) => Promise<RedirectionNavigationParams>
  ) {
    const response = {
      html: this.html,
      redirected: this.redirected,
      weirdData: this.weirdData,
      prevCookies: this.prevCookies,
    };
    if (await condition(response)) {
      return this.next(treat);
    }
    return this;
  }

  async next(
    treat: (config: RedirectionResponse) => Promise<RedirectionNavigationParams>
  ) {
    const navigation = await treat({
      html: this.html,
      redirected: this.redirected,
      weirdData: this.weirdData,
      prevCookies: this.prevCookies,
    });

    this.to = navigation.to;
    this.target = navigation.target;

    this.from = this.redirected || this.from;

    this.weirdData = navigation.weirdData || this.weirdData;

    return this.do();
  }

  stop(): RedirectionResponse {
    return {
      redirected: this.redirected,
      weirdData: this.weirdData,
      html: this.html,
      prevCookies: this.prevCookies,
    };
  }

  async fork(
    to: string,
    payload: any,
    config = {
      "X-MicrosoftAjax": "Delta=true",
      "X-Requested-With": "XMLHttpRequest",
      ADRUM: "isAjax:true",
    } as {},
    timeout: number = 30000
  ) {
    const cookies = mergeCookies(this.prevCookies, this.cookies);
    const isSaveAndForget = payload["ctl00$ibtnYes"] != undefined;
    if (!(payload instanceof FormData)) {
      payload = replaceNullValues(payload, "");
      payload = QueryEncode(payload);
    }

    try {
      const { data, headers } = await retryFailedRequests(
        () =>
          http.post(to, payload, {
            headers: {
              ...defaultHeader(cookies),
              Referer: this.from,
              "Content-Type": "application/x-www-form-urlencoded",
              ...config,
            },
            timeout: Math.abs(timeout),
          }),
        isSaveAndForget ? 1 : 3
      );

      this.weirdData = hiddenInputs(loadHtml(data));

      this.prevCookies = mergeCookies(
        this.cookies,
        this.prevCookies,
        headers["set-cookie"]
      );

      return data;
    } catch (e) {
      const failedRequest = {
        to,
        payload,
        headers: {
          ...defaultHeader(cookies),
          Referer: this.from,
          "Content-Type": "application/x-www-form-urlencoded",
          ...config,
        },
      };

      FailedRequest.publishMessage({
        json: failedRequest,
      });
    }
  }

  private async do() {
    const { cookies, from, to, weirdData, target } = this;
    const requestData = {
      ...weirdData,
      ctl00$hdnData_Data: "",
      ctl00$hdnData_Operation: "",
      ctl00$hdnPageName: pageNameBase64(from), // HomePage
      ctl00$hdnStopInterval: "True",
      ctl00$hdPageIDBookMarks: "",
      ctl00$hdPageControlsBookMarks: "",
      ctl00$hdFolderIDBookMarks: "",
      __EVENTARGUMENT: to || "",
      __EVENTTARGET: target ?? weirdData.__EVENTTARGET,
    };

    replaceNullValues(requestData, "");

    const {
      data: responseData,
      headers,
      request,
    } = await http.post(from, QueryEncode(requestData), {
      headers: {
        ...defaultHeader(cookies),
        Referer: from,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    return this.create({
      html: responseData,
      weirdData: hiddenInputs(loadHtml(responseData)),
      redirected: request.res.responseUrl as string,
      prevCookies: headers["set-cookie"] ?? [],
    });
  }

  setWeiredData(weirdData: { [key: string]: any }) {
    this.weirdData = weirdData as weird;
  }

  send(ob: { [key: string]: any }) {
    return {
      redirected: this.redirected,
      cookies: mergeCookies(this.prevCookies, this.cookies),
      from: this.from,
      weirdData: this.weirdData,
      payload: ob,
    };
  }

  sendForm(form: Form, ob?: { [key: string]: any }) {
    return {
      redirected: this.redirected,
      cookies: mergeCookies(this.prevCookies, this.cookies),
      from: this.from,
      weirdData: form.getWeirdData(),
      payload: {
        form: form.toJson(),
        ...form.toJson(),
        ...(ob ?? {}),
      },
    };
  }
}
