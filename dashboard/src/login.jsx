import React from "react";
import { GoogleAuthProvider, signInWithPopup,getAuth } from "firebase/auth";
import { useEffect } from "react";
import { firebaseApp } from "./main";

const provider = new GoogleAuthProvider();

const Login = () => {
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    signInWithPopup(auth, provider);
  }, []);
  return <></>;
};

export default Login;
