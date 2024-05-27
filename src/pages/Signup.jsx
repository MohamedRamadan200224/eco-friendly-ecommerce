import React, { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { setAuthToken, setAuthUser } from "../helper/Storage";
import { toast } from "react-hot-toast";

const Signup = () => {
  const navigate = useNavigate();

  const [signup, setSignup] = useState({
    email: "",
    password: "",
    name: "",
    passwordConfirm: "",
    role: "",
    loading: true,
    status: "",
    error: "",
  });
  const SignupFun = (e) => {
    e.preventDefault();
    // try {
    setSignup({
      ...signup,
    });

    if (signup.password !== signup.passwordConfirm) {
      toast.error("The Password And Confirm Password Do Not Match!");
    }

    axios
      .post(`http://localhost:8080/api/v1/users/signup`, {
        email: signup.email,
        password: signup.password,
        name: signup.name,
        passwordConfirm: signup.passwordConfirm,
        role: signup.role,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Successfully signed up!"); // Show success message
          setSignup({
            ...signup,
            status: resp.data.status,
            loading: false,
            error: "",
          });
          let tokenInfo = {};
          tokenInfo["jwtToken"] = resp.data.token;
          setAuthToken(tokenInfo);
          setAuthUser(resp.data.data.user);
          navigate("/");
        } else if (resp.data.status === "fail") {
          toast.error(resp.data.message); // Show error message
          setSignup({
            ...signup,
            status: resp.data.status,
            loading: false,
            error: resp.data.message,
          });
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setSignup({
          ...signup,
          loading: false,
          error: err.response.data.message,
        });
      });
  };

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <Header title="Register" subtitle="Sign up" />

      <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
        <div>
          <img src="/img_loginsignup.jpg" alt="hero_img" />
        </div>
        <div className="lg:w-[80%]">
          <div className="space-y-3">
            <h1 className="text-[28px] font-bold text-cold-blue">Sign Up</h1>
            <p className="text-lg text-cold-blue">
              Success Stories starts from here!
            </p>
          </div>
          <form method="POST" className="flex flex-col gap-10 mt-10">
            <input
              type="text"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Username*"
              name="user"
              value={signup.name}
              onChange={(e) => setSignup({ ...signup, name: e.target.value })}
              required
            />
            <input
              type="email"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Email*"
              name="email"
              value={signup.email}
              onChange={(e) => setSignup({ ...signup, email: e.target.value })}
              required
            />
            <input
              type="password"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Password*"
              name="pass1"
              value={signup.password}
              onChange={(e) =>
                setSignup({ ...signup, password: e.target.value })
              }
              required
            />
            <input
              type="password"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Confirm Password*"
              name="pass2"
              value={signup.passwordConfirm}
              onChange={(e) =>
                setSignup({ ...signup, passwordConfirm: e.target.value })
              }
              required
            />
            <select
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              required
              value={signup.role}
              onChange={(e) => setSignup({ ...signup, role: e.target.value })}
            >
              <option selected>Choose a role</option>
              <option value="user">User</option>
              <option value="company">Company</option>
            </select>

            <div className="flex flex-col items-center gap-5">
              <input
                type="submit"
                className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
                value="Signup"
                onClick={SignupFun}
              />

              <p className="text-lg text-cold-blue">
                Already have an account ?
              </p>
              <button
                className="h-[50px] w-full cursor-pointer rounded-[200px] border border-mint bg-transparent px-[20px] py-[12px] font-bold text-cold-blue duration-300 ease-out hover:bg-mint "
                onClick={goToLogin}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default Signup;
