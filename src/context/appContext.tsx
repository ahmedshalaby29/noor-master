import {
  Auth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import React, { createContext, useEffect, useReducer, useRef } from "react";
import appAction from "../actions/appAction";
import { emulator, firebaseApp } from "../main";
import { AppStateInit, IAppProvider } from "../models/app_model";
import Repository from "../repository";
import { LoginCredential } from "../types/login_types";

import { trace } from "firebase/performance";

import { perf } from "../main";

export const AppContext = createContext<IAppProvider>(null!);

let auth: Auth;

const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(appAction, AppStateInit);

  const traceLogin = useRef(trace(perf, "login"));

  useEffect(() => {
    traceLogin.current.start();
  }, []);

  useEffect(() => {
    auth = getAuth(firebaseApp);

    if (emulator)
      connectAuthEmulator(auth, "http://localhost:9099", {
        disableWarnings: true,
      });

    return onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("fetched user", user);
        dispatch({ type: "login", payload: user });
      } else {
        logout().then(() => {
          if (state.user) {
            window.location.reload();
          }
        });
      }
    });
  }, [dispatch]);

  async function login(credential: LoginCredential): Promise<boolean> {
    const { operation, data } = await Repository.instance.checkLoginInformation(
      state.loginFormParams!,
      credential
    );

    if (operation == "success") {
      try {
        traceLogin.current.stop();
      } catch (e) {}

      signInWithEmailAndPassword(
        auth,
        credential.name + "@noor.com",
        credential.password
      )
        .catch((e) => {
          return createUserWithEmailAndPassword(
            auth,
            credential.name + "@noor.com",
            credential.password
          );
        })
        .catch((e) => {
          window.location.reload();
          // todo catch this error
        });
      return true;
    }
    localStorage.removeItem("bouncing");
    return false;
  }

  async function loadLoginParams() {
    const params = await Repository.instance.getLoginFormParams();

    dispatch({ type: "loginFormParams", payload: params });
  }

  async function logout() {
    localStorage.removeItem("bouncing");

    await auth.signOut();

    dispatch({ type: "logout" });
  }

  async function refrechToken(tryPeroid?: number) {
    const { user } = state;
    const prevTryPeriod = (await user?.getIdTokenResult())?.claims?.try ?? 0;
    if (!tryPeroid || prevTryPeriod != tryPeroid) {
      await user?.getIdToken(true);
    }
  }

  const values: IAppProvider = {
    ...state,
    login,
    loadLoginParams,
    logout,
    refrechToken,
  };

  return <AppContext.Provider value={values}>{children}</AppContext.Provider>;
};

export default AppProvider;
