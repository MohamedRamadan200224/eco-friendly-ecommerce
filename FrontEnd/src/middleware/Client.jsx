import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../helper/Storage";

const Client = () => {
  const auth = getAuthToken();
  const user = getAuthUser();
  return auth && (user.role === "company" || user.role === "admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default Client;
