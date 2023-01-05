import { Transition } from "@headlessui/react";
import React, { useContext, useEffect, useState } from "react";
import { Loader } from "react-feather";
import { AppContext } from "../context/appContext";

import Logo from "../assets/logo.png";

const Login: React.FC = ({}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchCode, setCaptchCode] = useState<number>();
  const { loadLoginParams, login, loginFormParams } = useContext(AppContext);
  const [captchaBase64, setCaptchaBase64] = useState("");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadLoginParams();
  }, []);

  useEffect(() => {
    if (loginFormParams?.captcha) {
      setCaptchaBase64(loginFormParams.captcha);
      setLoading(false);
    }
  }, [loginFormParams]);

  const submit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (captchCode?.toString().length != 4) {
      return;
    }
    setLoading(true);

    login({
      captcha: captchCode as number,
      name: username,
      password,
      key:loginFormParams?.key
    }).then((result) => {
      console.log(result)

      if (result) {
        setSuccess(true);
      } else {    
        setError(true);
        setLoading(true);
        loadLoginParams();
        setCaptchCode(undefined);
        setPassword("");
        setUsername("");
        setCaptchaBase64("");
        setTimeout(() => setError(false), 3000);
      }
    });
  };

  return (
    <div className="w-screen h-screen bg-gray-200 flex items-center justify-center">
      <div className="mx-auto rounded max-w-lg p-4 shadow bg-white">
        <img src={Logo} className="w-28 aspect-square mx-auto" />
        <h1 className="mt-4 text-center font-bold text-md  text-indigo-600 ">
          سجل دخول بنفس معلومات دخولك على نور
        </h1>
        <form
          onSubmit={submit}
          className="mx-auto text-right"
          style={{ direction: "rtl" }}
        >
          <div>
            <label className="text-gray-600 text-sm w-full">
              {" "}
              اسم المستخدم
            </label>

            <input
              className="block bg-gray-100 rounded-md p-1 ring-1 ring-indigo-400"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="mt-2">
            <label className="text-gray-600 text-sm w-full">كلمة المرور</label>

            <input
              className="block bg-gray-100 rounded-md p-1 ring-1 ring-indigo-400"
              name="username"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center flex-col mt-4">
            <label className="text-gray-600 w-full text-left text-sm">
              Captcha
            </label>

            <Transition
              show={captchaBase64 != ""}
              enter="transition-all duration-500"
              enterFrom="opacity-0 h-0"
              enterTo="opacity-100 h-auto"
              className="flex items-center flex-col"
            >
              {captchaBase64 && (
                <>
                  <div className="w-24 h-12 bg-indigo-100  my-2">
                    {captchaBase64 && (
                      <img
                        className="w-full h-full"
                        src={`data:image/png;base64, ${captchaBase64}`}
                      />
                    )}
                  </div>
                  <input
                    className="block bg-gray-100 w-1/2 rounded-md p-1 ring-1 ring-indigo-400"
                    name="captcha"
                    type="number"
                    value={captchCode}
                    onChange={(e) => setCaptchCode(parseInt(e.target.value))}
                  />
                </>
              )}
            </Transition>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mx-auto block p-2 w-full mt-4 text-white ${
              success ? "bg-green-500" : error ? "bg-red-500" : "bg-indigo-500"
            } rounded-sm`}
          >
            {!loading && <span>Login</span>}
            {loading && <Loader className="mx-auto animate-spin w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
