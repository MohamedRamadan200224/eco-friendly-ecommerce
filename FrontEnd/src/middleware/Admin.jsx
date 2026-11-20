import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";

const Admin = () => {
  const user = getAuthUser();
  return user && user.role === "admin" ? <Outlet /> : <Navigate to="/" />;
};

export default Admin;
