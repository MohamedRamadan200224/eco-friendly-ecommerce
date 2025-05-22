import axios from "axios";
import React, { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import "react-toastify/dist/ReactToastify.css";
import { setAuthToken, setAuthUser } from "../helper/Storage";
import { toast } from "react-hot-toast";
const Login = () => {
  const navigate = useNavigate();
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [login, setLogin] = useState({
    email: "",
    password: "",
    loading: true,
    status: "",
    error: "",
  });
  const LoginFun = (e) => {
    e.preventDefault();
    // try {
    setLogin({
      ...login,
    });

    toast.loading("Logging In...", {
      duration: 500,
    });

    axios
      .post(`http://localhost:3000/api/v1/users/login`, {
        email: login.email,
        password: login.password,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Successfully Logged In!"); // Show success message
          setLogin({
            ...login,
            status: resp.data.status,
            loading: false,
            error: "",
          });
          let tokenInfo = {};
          tokenInfo["jwtToken"] = resp.data.token;
          setAuthToken(tokenInfo);
          setAuthUser(resp.data.data.user);
          navigate("/");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message); // Show error message
        setLogin({
          ...login,
          loading: false,
          error: err.response.data.message,
        });
      });
  };

  const forgotPass = (e) => {
    e.preventDefault();
    // try {

    toast.loading("Checking Email...", {
      duration: 500,
    });

    axios
      .post(`http://localhost:3000/api/v1/users/forgotPassword`, {
        email: email,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Check Your Email!"); // Show success message
        }
        setForgot(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message); // Show error message
      });
  };

  const goToSignup = () => {
    navigate("/signup");
  };
  return (
    <>
      <Header title="Login" subtitle="Sign in" />

      <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
        <div>
          <img src="/img_loginsignup.jpg" alt="hero_img" />
        </div>
        <div className="lg:w-[80%]">
          <div className="space-y-3">
            <h1 className="text-[28px] font-bold text-cold-blue">Login</h1>

            <p className="text-lg text-cold-blue">
              Lets make world better, Together!
            </p>
          </div>
          <form method="POST" className="flex flex-col gap-10 mt-10">
            <input
              type="text"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Email*"
              required
              name="email"
              value={login.email}
              onChange={(e) => setLogin({ ...login, email: e.target.value })}
            />
            <input
              type="password"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Password*"
              name="passoword"
              required
              value={login.password}
              onChange={(e) => setLogin({ ...login, password: e.target.value })}
            />

            <div className="flex justify-between">
              <div className="flex items-center"></div>
              {forgot === true ? (
                <div className=" w-full my-2 mx-2 items-center">
                  <button
                    onClick={() => setForgot(false)}
                    className="float-right text-lg font-bold cursor-pointer text-red-400 hover:text-red-500"
                  >
                    X
                  </button>

                  <div>
                    <input
                      type="text"
                      className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                      placeholder="Email*"
                      required
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="float-right">
                    <input
                      type="submit"
                      value="Post Review"
                      onClick={forgotPass}
                      className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                    />
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setForgot(true)}
                  className="text-sm text-light-orange"
                >
                  Forget Password?
                </button>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <input
                type="submit"
                className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
                value="Login"
                onClick={LoginFun}
              />
              <button
                className="h-[50px] w-full cursor-pointer rounded-[200px] border border-mint bg-transparent px-[20px] py-[12px] font-bold text-cold-blue duration-300 ease-out hover:bg-mint "
                onClick={goToSignup}
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Login;
