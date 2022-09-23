import axios from "axios";
import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
import { initializeApp } from "firebase/app";

const dev = process.env.NODE_ENV == "development" && true;

if (dev) {
  axios.defaults.baseURL = "http://localhost:5050";
}


const firebaseConfig = {
  apiKey: "AIzaSyAJv-Cjmz_nzv5KUtRjnJiO5h0imIbSZFw",
  authDomain: "formal-ember-345513.firebaseapp.com",
  projectId: "formal-ember-345513",
  storageBucket: "formal-ember-345513.appspot.com",
  messagingSenderId: "804272565837",
  appId: "1:804272565837:web:61b7e1c24552ee748a3604",
  measurementId: "G-BZ2BGX92YX"
};
export const firebaseApp = initializeApp(firebaseConfig);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
