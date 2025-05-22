import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { getAuthToken } from "../helper/Storage";

const Guest = () => {
  const auth = getAuthToken();
  return auth ? <Outlet /> : <Navigate to="/" />;
};

export default Guest;
