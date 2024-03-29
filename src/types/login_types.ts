
export type LoginCredential = {
  name: string;
  password: string;
  captcha: number;
  key:string | undefined;
};

export type ChangeUserPasswordResponse = {
  email: string;
  newPassword: string;
};

export type LoginFormParamsResponse = {
  __VIEWSTATEGENERATOR: string;
  __VIEWSTATEENCRYPTED: string;
  __EVENTVALIDATION: string;
  __VIEWSTATE: string;
  cookies: string[];
};
export interface LoginFormParams extends LoginFormParamsResponse {
  captcha: string;
  key:string;
}

export type LoginSubmissionResponse = {
  data: string[];
  operation: "success" | "failer";
};
