import { AppState, AppActions } from "../models/app_model";

export default (state: AppState, action: AppActions): AppState => {
  if (action.type == "login")
    return {
      ...state,
      loading: false,
      user: action.payload,
    };
  else if (action.type == "loading_on")
    return {
      ...state,
      loading: true,
    };
  else if (action.type == "logout")
    return {
      ...state,
      loading: false,
      user: undefined,
      loginFormParams: undefined,
    };
  else if (action.type == "loading_off")
    return {
      ...state,
      loading: false,
    };
  else if (action.type == "loginFormParams")
    return {
      ...state,
      loginFormParams: action.payload,
      loading: false,
    };
  else return state;
};
