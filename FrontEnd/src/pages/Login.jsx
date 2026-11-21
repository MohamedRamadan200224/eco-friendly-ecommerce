// Login page.
//
// Requests go through the shared api client (cookie auth, one shared
// error toast) instead of raw axios + hardcoded localhost URLs. The
// react-toastify CSS import is removed — react-hot-toast is the only
// toast library now. Auth is cookie-based: the backend sets an httpOnly
// jwt cookie on login and the user object is stored via setAuthUser;
// no token is ever written to browser storage.
import { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import { setAuthUser } from "../helper/Storage";
import { toast } from "react-hot-toast";
import api, { hideImgOnError } from "../api/client";
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

    api
      .post(`/api/v1/users/login`, {
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
          setAuthUser(resp.data.data.user);
          navigate("/");
        }
      })
      .catch((err) => {
        // Error already toasted once by the api client interceptor.
        setLogin({
          ...login,
          loading: false,
          error: err.response ? err.response.data.message : err.message,
        });
      });
  };

  const forgotPass = (e) => {
    e.preventDefault();
    // try {

    toast.loading("Checking Email...", {
      duration: 500,
    });

    api
      .post(`/api/v1/users/forgotPassword`, {
        email: email,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Check Your Email!"); // Show success message
        }
        setForgot(false);
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
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
          <img src="/img_loginsignup.jpg" alt="hero_img" onError={hideImgOnError} />
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

          {/* Forgot password is a SEPARATE form, not a block inside the
              login form. It used to live inside the login form with a
              second input also named "email", so pressing Enter in the
              reset email field submitted the LOGIN form instead of the
              reset — the login then went out with the wrong/empty email
              and came back 401 "Incorrect email or password". The reset
              submit was also mislabelled with a review-related label. */}
          {forgot === true ? (
            <form onSubmit={forgotPass} className="flex flex-col gap-3 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-cold-blue">
                  Reset your password
                </span>
                <button
                  type="button"
                  onClick={() => setForgot(false)}
                  className="text-lg font-bold cursor-pointer text-red-400 hover:text-red-500"
                >
                  X
                </button>
              </div>

              <input
                type="text"
                className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                placeholder="Email for reset link*"
                required
                name="resetEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="float-right">
                <input
                  type="submit"
                  value="Send reset link"
                  className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                />
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setForgot(true)}
              className="text-sm text-light-orange mt-6"
            >
              Forget Password?
            </button>
          )}
        </div>
      </section>
    </>
  );
};

export default Login;
