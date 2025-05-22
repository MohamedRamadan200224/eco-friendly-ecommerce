import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser, getAuthToken } from "../helper/Storage";

const Admin = () => {
  const auth = getAuthToken();
  const user = getAuthUser();
  return auth && user.role === "admin" ? <Outlet /> : <Navigate to="/" />;
};

export default Admin;
