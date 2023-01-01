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
import {
  LoginFormParams,
  LoginSubmissionResponse,
  ChangeUserPasswordResponse,
} from "../types/login_types";
import { mergeCookies } from "../utils";
import axios from "axios";
import { auth } from "../context/appContext";

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

  private async callFunction<R>(name: string, data?: any) {
    return httpsCallable<typeof data, R>(this.functions, name)(data);
  }
  public async callApi<R>(name: string, data?: any) {
    const requestData = {
      data,
      user: auth.currentUser,
    };
    const response = await axios.post(
      "https://158.101.230.164/" + name,
      requestData
    );

    return response.data;
  }

  async getLoginFormParams() {
    const response = await this.callApi<LoginFormParams>("signForm");

    return response;
  }

  async checkLoginInformation(
    params: LoginFormParams,
    info: { name: string; password: string; captcha: number }
  ) {
    const response = await this.callApi<LoginSubmissionResponse>(
      "postSignForm",
      {
        ...params,
        ...info,
      }
    );
    console.log(response);
    if (response.operation == "success") {
      this.updateBouncingData({ cookies: response.data });
    }
    return response;
  }

  async changeUserPassword(info: { email: string; password: string }) {
    const response = await this.callFunction<ChangeUserPasswordResponse>(
      "changeUserPassword",
      { ...info }
    );
    return response.data;
  }

  async navigateTo(config: NavigateTo) {
    const response = await this.callApi<FormNavigateResponse>("navigation", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.cookies,
      from: response.redirected || response.from,
      weirdData: response.weirdData,
    });
    console.log("navigate to:::::");
    return response.payload;
  }

  async formFetchOption(config: FormOptions) {
    console.log("formFetchOption");
    const response = await this.callApi<FormNavigateResponse>("formOptions", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.cookies,
      from: response.redirected || response.from,
      weirdData: response.weirdData,
    });
    return response.payload;
  }

  async submitForm<
    T extends FormSubmitLookup["type"],
    B extends Omit<FormSubmitLookup & { type: T }, "type">
  >(type: T, config: {}) {
    //@ts-ignore
    const response = await this.callApi<B["response"]>(type, {
      ...(config as {}),
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.cookies,
      from: response.redirected || response.from,
      weirdData: response.weirdData,
    });

    return response.payload;
  }

  async editSkillSave(config: EditSkillSubmit) {
    const response = await this.callApi<FormNavigateResponse>("skillSave", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.cookies,
      from: response.redirected || response.from,
      weirdData: response.weirdData,
    });

    return response.payload;
  }

  async saveDegree(config: DegreeSave) {
    const response = await this.callApi<FormNavigateResponse>("degreeSave", {
      ...config,
      ...(this.bouncingData ?? {}),
    });

    this.updateBouncingData({
      cookies: response.cookies,
      from: response.redirected || response.from,
      weirdData: response.weirdData,
    });

    return response.payload;
  }

  async getPrice() {
    const response = await this.callFunction<Prices>("price");
    return response.data;
  }

  async createPaypalOrder(price: number) {
    const response = await this.callFunction<any>("paypalCreateOrder", {
      price,
    });
    return response.data;
  }

  async paypalHandleOrder(orderId: any, price: number) {
    const response = await this.callFunction<any>("paypalHandleOrder", {
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
