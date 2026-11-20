import { Outlet, Navigate } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";

const Guest = () => {
  const user = getAuthUser();
  return user ? <Outlet /> : <Navigate to="/" />;
};

export default Guest;
