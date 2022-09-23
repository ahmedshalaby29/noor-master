import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
  httpsCallable,
} from "firebase/functions";
import { Prices } from "../components/home/buyMessage";
import { emulator, firebaseApp } from "../main";
import {
  BouncingNavigation,
  DegreeSave,
  EditSkillSubmit,
  FormNavigateResponse,
  FormOptions,
  FormSubmitLookup,
  NavigateTo,
} from "../types/communication_types";
import { LoginFormParams, LoginSubmissionResponse } from "../types/login_types";
import { mergeCookies } from "../utils";

export default class Repository {
  private functions: Functions;
  private static _instance?: Repository;
  private bouncingData?: BouncingNavigation;

  static get instance() {
    if (!Repository._instance) {
      Repository._instance = new Repository();
    }
    return Repository._instance!;
  }

  isExpired() {
    const expirationTime = 50 * 60; // 5mins
    console.log(
      "checking expiration date:",
      Date.now() - (new Date(this.bouncingData?.date ?? "").getTime() ?? 0),
      expirationTime * 1000
    );
    return (
      Date.now() - (new Date(this.bouncingData?.date ?? "").getTime() ?? 0) >
      expirationTime * 1000
    );
  }

  trustMe() {
    return this.bouncingData;
  }

  constructor() {
    this.functions = getFunctions(firebaseApp, "asia-south1");
    if (emulator) {
      connectFunctionsEmulator(this.functions, "localhost", 5001);
    }

    const cache = localStorage.getItem("bouncing");
    if (cache) {
      this.bouncingData = JSON.parse(cache);
    }
  }

  private call<R>(name: string, data?: any) {
    return httpsCallable<typeof data, R>(this.functions, name)(data);
  }

  async getLoginFormParams() {
    const response = await this.call<LoginFormParams>("signForm");

    return response.data;
  }

  async checkLoginInformation(
    params: LoginFormParams,
    info: { name: string; password: string; captcha: number }
  ) {
    const response = await this.call<LoginSubmissionResponse>("postSignForm", {
      ...params,
      ...info,
    });

    if (response.data.operation == "success") {
      this.updateBouncingData({ cookies: response.data.data });
    }
    return response.data;
  }

  async navigateTo(config: NavigateTo) {
    const response = await this.call<FormNavigateResponse>("navigation", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.data.cookies,
      from: response.data.redirected || response.data.from,
      weirdData: response.data.weirdData,
    });
    console.log("navigate to:::::");
    return response.data.payload;
  }

  async formFetchOption(config: FormOptions) {
    const response = await this.call<FormNavigateResponse>("formOption", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.data.cookies,
      from: response.data.redirected || response.data.from,
      weirdData: response.data.weirdData,
    });

    return response.data.payload;
  }

  async submitForm<
    T extends FormSubmitLookup["type"],
    B extends Omit<FormSubmitLookup & { type: T }, "type">
  >(type: T, config: {}) {
    const response = await this.call<B["response"]>(type, {
      ...(config as {}),
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.data.cookies,
      from: response.data.redirected || response.data.from,
      weirdData: response.data.weirdData,
    });

    return response.data.payload;
  }

  async editSkillSave(config: EditSkillSubmit) {
    const response = await this.call<FormNavigateResponse>("skillSave", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.data.cookies,
      from: response.data.redirected || response.data.from,
      weirdData: response.data.weirdData,
    });

    return response.data.payload;
  }

  async saveDegree(config: DegreeSave) {
    const response = await this.call<FormNavigateResponse>("degreeSave", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.data.cookies,
      from: response.data.redirected || response.data.from,
      weirdData: response.data.weirdData,
    });

    return response.data.payload;
  }

  async getPrice() {
    const response = await this.call<Prices>("price");
    return response.data;
  }

  async createPaypalOrder(price: number) {
    const response = await this.call<any>("paypalCreateOrder", { price });
    return response.data;
  }

  async paypalHandleOrder(orderId: any, price: number) {
    const response = await this.call<any>("paypalHandleOrder", {
      orderId,
      price,
    });
    return response.data;
  }

  private updateBouncingData(config: Partial<BouncingNavigation>) {
    if (!this.bouncingData) {
      this.bouncingData = {
        cookies: [],
        ...config,
        date: new Date(),
      };
    } else {
      this.bouncingData = {
        cookies: config.cookies ?? this.bouncingData.cookies,
        from: config.from ?? this.bouncingData.from,
        weirdData: config.weirdData ?? this.bouncingData.weirdData,
        date: new Date(),
      };
    }

    localStorage.setItem(
      "bouncing",
      JSON.stringify({
        weirdData: this.bouncingData.weirdData,
        cookies: mergeCookies(this.bouncingData.cookies),
        from: this.bouncingData.from,
        date: this.bouncingData.date,
      })
    );
  }
}
