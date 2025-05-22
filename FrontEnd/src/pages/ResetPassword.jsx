import axios from "axios";
import React, { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import "react-toastify/dist/ReactToastify.css";
import { setAuthToken, setAuthUser } from "../helper/Storage";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [reset, setReset] = useState("");
  const ResetFun = (e) => {
    e.preventDefault();
    // try {
    setReset({
      ...reset,
    });

    toast.loading("Changing Password...", {
      duration: 500,
    });

    axios
      .patch(`http://localhost:3000/api/v1/users/resetPassword/${token}`, {
        passwordConfirm: reset.passwordConfirm,
        password: reset.password,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Successfully Changed Password!"); // Show success message
          setReset({
            ...reset,
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
        setReset({
          ...reset,
          loading: false,
          error: err.response.data.message,
        });
      });
  };

  // const goToSignup = () => {
  //   navigate("/signup");
  // };
  return (
    <>
      <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
        <div>
          <img src="/img_loginsignup.jpg" alt="hero_img" />
        </div>
        <div className="lg:w-[80%]">
          <div className="space-y-3">
            <h1 className="text-[28px] font-bold text-cold-blue">
              Reset Password
            </h1>

            <p className="text-lg text-cold-blue">
              Lets make world better, Together!
            </p>
          </div>
          <form method="POST" className="flex flex-col gap-10 mt-10">
            <input
              type="password"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Enter your new password"
              required
              name="pass"
              value={reset.password}
              onChange={(e) => setReset({ ...reset, password: e.target.value })}
            />
            <input
              type="password"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              placeholder="Confirm Password"
              name="password"
              required
              value={reset.passwordConfirm}
              onChange={(e) =>
                setReset({ ...reset, passwordConfirm: e.target.value })
              }
            />

            <div className="flex flex-col gap-5">
              <input
                type="submit"
                className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
                value="Change Password"
                onClick={ResetFun}
              />
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ResetPassword;
