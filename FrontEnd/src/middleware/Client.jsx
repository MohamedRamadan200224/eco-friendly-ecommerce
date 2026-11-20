import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";

const Client = () => {
  const user = getAuthUser();
  return user && (user.role === "company" || user.role === "admin") ? (
    <Outlet />
  ) : (
    <Navigate to="/" />
  );
};

export default Client;
