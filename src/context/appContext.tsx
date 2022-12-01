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
import { FirebaseError } from "@firebase/util";

export const AppContext = createContext<IAppProvider>(null!);

export let auth: Auth;

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

    // const operation = "success";
    if (operation == "success") {
      try {
        traceLogin.current.stop();
      } catch (e) {}

      signInWithEmailAndPassword(
        auth,
        credential.name + "@noor.com",
        credential.password
      )
        .catch(async (e: FirebaseError) => {
          console.log(e.code)
          if (e.code == "auth/wrong-password") {
            //change user password and login with the info returned from backend
            const { email, newPassword } =
              await Repository.instance.changeUserPassword({
                email: credential.name + "@noor.com",
                password: credential.password,
              });
            console.log(
              "changeUserPassword result: " + email + " " + newPassword
            );
            signInWithEmailAndPassword(auth, email, newPassword).catch(
              (e: FirebaseError) => {
                console.log(e.code);
              }
            );
            return true;
          }
          return createUserWithEmailAndPassword(
            auth,
            credential.name + "@noor.com",
            credential.password
          );
        })
        .catch((e) => {
            // todo catch this error
          console.log("final catch " + e.message);
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
