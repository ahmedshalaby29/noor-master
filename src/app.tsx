import React, { Suspense, useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Loading from "./components/loading";
import { AppContext } from "./context/appContext";
import { HomeTab } from "./models/home_model";
import Login from "./views/login";

const SavePeriod = React.lazy(() => import("./views/home/savePeriod"));
const DidntGet = React.lazy(() => import("./views/home/didntGet"));
const EditSkill = React.lazy(() => import("./views/home/editSkill"));
const Onboarding = React.lazy(() => import("./views/home/onboarding"));
const SaveAll = React.lazy(() => import("./views/home/saveAll"));
const SaveCustom = React.lazy(() => import("./views/home/saveCustom"));
const SaveDegree = React.lazy(() => import("./views/home/saveDegree"));
const SavedReports = React.lazy(() => import("./views/home/savedReports"));
const SaveReport = React.lazy(() => import("./views/home/saveReport"));

const Home = React.lazy(() => import("./views/home"));
const HomeProvider = React.lazy(() => import("./context/homeContext"));

function App() {
  const app = useContext(AppContext);

  if (app?.loading) {
    return <Loading />;
  }

  const { user } = app;

  return (
    <BrowserRouter>
      <Routes>
        {!user && (
          <>
            <Route path="/login" element={<Login />} />

            <Route path="*" element={<Navigate replace to="/login" />} />
          </>
        )}

        {user && (
          <>
            <Route
              path="/"
              element={
                <Suspense fallback={<Loading />}>
                  <HomeProvider>
                    <Home />
                  </HomeProvider>
                </Suspense>
              }
            >
              <Route
                path={HomeTab.saveAll}
                element={
                  <Suspense fallback={<></>}>
                    <SaveAll />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.savePeriod}
                element={
                  <Suspense fallback={<></>}>
                    <SavePeriod />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.editSkill}
                element={
                  <Suspense fallback={<></>}>
                    <EditSkill />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.saveCustom}
                element={
                  <Suspense fallback={<></>}>
                    <SaveCustom />
                  </Suspense>
                }
              />

              <Route
                path={HomeTab.saveReport}
                element={
                  <Suspense fallback={<></>}>
                    <SaveReport />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.saveReportSkill}
                element={
                  <Suspense fallback={<></>}>
                    <SaveReport type1 />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.savedegree}
                element={
                  <Suspense fallback={<></>}>
                    <SaveDegree />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.didntGet}
                element={
                  <Suspense fallback={<></>}>
                    <DidntGet />
                  </Suspense>
                }
              />
              <Route
                path={HomeTab.savedReports}
                element={
                  <Suspense fallback={<></>}>
                    <SavedReports />
                  </Suspense>
                }
              />
              <Route path={HomeTab.logout} element={<span>bay bay</span>} />

              <Route
                index
                element={
                  <Suspense fallback={<></>}>
                    <Onboarding />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
