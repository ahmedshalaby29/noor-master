import { User } from "firebase/auth";
import { LoginCredential, LoginFormParams } from "../types/login_types";

export type AppActions =
  | {
      type: "login";
      payload: User;
    }
  | {
      type: "loginFormParams";
      payload: LoginFormParams;
    }
  | {
      type: "loading_on";
    }
  | {
      type: "loading_off";
    }
  | {
      type: "logout";
    };

export type AppState = {
  loading: boolean;
  user?: User;
  loginFormParams?: LoginFormParams;
};

export const AppStateInit: AppState = {
  loading: true,
};

export interface IAppProvider extends AppState {
  login(credential: LoginCredential): Promise<boolean>;

  loadLoginParams(): Promise<void>;

  logout(): Promise<void>;

  refrechToken(tryPeriod?: number): Promise<void>;
}
