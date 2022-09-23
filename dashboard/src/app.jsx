import React, { Suspense, useState } from "react";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import "./index.css";
import { useEffect } from "react";
import { firebaseApp } from "./main";
import axios from "axios";

const Builder = React.lazy(() => import("./builder"));
const Dashboard = React.lazy(() => import("./dashboard"));
const Login = React.lazy(() => import("./login"));

const App = () => {
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const auth = getAuth(firebaseApp);
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user) {
      axios.interceptors.request.use(async (config) => {
        const token = await user.getIdToken();

        config.headers.auth = token;
        return config;
      });
    }
  }, [user]);

  if (loading) return <span>Loading ...</span>;

  return (
    <HashRouter>
      <Routes>
        {!user && (
          <Route
            index
            path="*"
            element={
              <Suspense fallback={<span>loading</span>}>
                <Login />
              </Suspense>
            }
          />
        )}

        {user && (
          <>
            <Route
              path="/builder"
              element={
                <Suspense fallback={<span>loading</span>}>
                  <Builder />
                </Suspense>
              }
            />
            <Route
              index
              element={
                <Suspense fallback={<span>loading</span>}>
                  <Dashboard />
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </HashRouter>
  );
};

export default App;
