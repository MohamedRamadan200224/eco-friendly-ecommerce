import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NAV_LINKS } from "../../constants";
import { AiOutlineClose, AiOutlineMenu } from "react-icons/ai";
import { RiShoppingCartLine } from "react-icons/ri";
import { CgProfile } from "react-icons/cg";
import CartModal from "./CartModal";
import api from "../api/client";
import { getAuthUser, removeAuthUser } from "../helper/Storage";

const Navbar = () => {
  const [nav, setNav] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);

  const user = getAuthUser();
  const auth = !!user;
  const navigate = useNavigate();

  const Logout = async (e) => {
    e.preventDefault();
    // Tell the server to clear the httpOnly `jwt` cookie first. The old
    // code only cleared sessionStorage, so the 90-day cookie stayed valid
    // and credentialed API calls stayed authenticated after "logout".
    // Logout still proceeds locally if the call itself fails (the cookie
    // may already be gone).
    try {
      await api.post("/api/v1/users/logout");
    } catch {
      // Already logged out server-side; still clear local state below.
    }
    removeAuthUser();
    navigate("/");
  };

  const handleNav = () => {
    setNav(!nav);
  };

  return (
    <nav className="max-container padding-container mt-5  h-[80px] w-[95%] items-center">
      <div className="flex items-center justify-between">
        <img
          src="/logo-greengray.png"
          alt="hero_img"
          className="hidden lg:block"
          style={{ width: "160px", height: "55px" }}
        />
        {/* <p className="hidden lg:block">GreenGray Market</p> */}
        <div className="flex items-center">
          <ul className="hidden items-center justify-center gap-[10px] lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                to={link.href}
                key={link.key}
                className="px-[1rem] text-base text-green-600 hover:border-b-2 hover:border-green-800 hover:text-green-800 ease-in-out duration-100 focus:text-green-800 focus:border-b-2 focus:border-green-800"
              >
                {link.label}
              </Link>
            ))}

            {!auth && (
              <>
                <Link to="signup" className="pl-[1rem]">
                  Register
                </Link>
                <Link to="login" className="pl-[1rem]">
                  Login
                </Link>
              </>
            )}
            {auth && (
              <button
                className="pl-[1rem] text-red-500 hover:text-red-700"
                onClick={Logout}
              >
                Logout
              </button>
            )}
          </ul>
        </div>
        <div className="items-center hidden gap-6 lg:flex">
          {auth && (
            <Link to="/profile">
              <CgProfile size={20} color="green" />
            </Link>
          )}
          {auth && (user.role === "user" || user.role === "expert") && (
            <button onClick={() => setShowCartModal(true)}>
              <RiShoppingCartLine color="green" size={20} />
            </button>
          )}
        </div>
      </div>

      {/* MOBILE VIEW */}
      <div className="flex justify-between">
        <p className="block lg:hidden">GreenGray Market</p>
        <div className="flex gap-5 lg:hidden">
          <Link to="/profile">
            <CgProfile size={24} color="green" />
          </Link>
          {auth && (user.role === "user" || user.role === "expert") && (
            <button onClick={() => setShowCartModal(true)}>
              <RiShoppingCartLine color="green" size={24} />
            </button>
          )}
          <span onClick={handleNav}>
            {nav ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
          </span>
        </div>

        <div
          className={
            nav
              ? "sm:top- fixed right-5 top-[10%] z-50 h-[260px] w-[50%] rounded-3xl bg-white px-5 drop-shadow-2xl duration-500 ease-in-out md:w-[30%]"
              : "fixed -top-[100%]"
          }
        >
          <ul className="flex flex-col items-center justify-center w-full text-sm uppercase">
            {NAV_LINKS.map((link) => (
              <li
                className="p-4 text-green-600 border-b cursor-pointer"
                key={link.key}
              >
                <Link to={link.href}>{link.label}</Link>
              </li>
            ))}
            <li className="mt-3 capitalize">
              <Link
                to="signup"
                className="rounded-[200px] bg-mint px-[25px] py-[10px] text-[14px] font-medium shadow-md"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Rendered at the nav root so it is not hidden on mobile: it used
          to live inside the `hidden lg:flex` desktop container, so the
          cart modal was display: none below the lg breakpoint. */}
      {showCartModal === true && (
        <CartModal onClose={() => setShowCartModal(false)} />
      )}
    </nav>
  );
};

export default Navbar;
