import { initializeApp } from "firebase/app";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import "./style/index.css";
import { getPerformance } from "firebase/performance";

export const emulator = process.env.NODE_ENV == "development" && true;

export const firebaseApp = initializeApp({
  apiKey: "AIzaSyCgxZUu5IbdkNzKl_aJ0EzhY2tagAbimB8",
  authDomain: "moaaz-354323.firebaseapp.com",
  projectId: "moaaz-354323",
  storageBucket: "moaaz-354323.appspot.com",
  messagingSenderId: "1048392186820",
  appId: "1:1048392186820:web:52982b13b5ce42f03f8291",
  measurementId: "G-2CPHW20WWD",
});

const App = React.lazy(() => import("./app"));
const AppProvider = React.lazy(() => import("./context/appContext"));

export const perf = getPerformance(firebaseApp);

ReactDOM.render(
  <Suspense fallback={<span></span>}>
    <AppProvider>
      <App />
    </AppProvider>
  </Suspense>,
  document.getElementById("root")
);
