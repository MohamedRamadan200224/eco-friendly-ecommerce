import React from "react";
import { FaFacebookSquare, FaInstagram, FaTwitterSquare } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getAuthToken } from "../helper/Storage";

const Footer = () => {
  const auth = getAuthToken();
  return (
    <footer className="mt-[100px] bg-[url('/bg_footer.png')] bg-cover bg-no-repeat 2xl:relative">
      <div className="grid gap-8 px-4 pt-12 text-gray-300 max-container padding-container lg:grid-cols-3">
        <div>
          <h1 className="w-full text-sm font-bold text-green-600">
            About GreenGrey Market
          </h1>
          <p className="py-4 text-sm text-[#999999]">
            Shop with purpose and join us in shaping a greener future, one
            purchase at a time.
          </p>
          <div className="md:[75%] my-6 flex gap-4">
            <FaTwitterSquare size={30} color="#00b9ff" />
            <FaInstagram size={30} color="black" />
            <FaFacebookSquare size={30} color="#3b5998" />
          </div>
        </div>
        <div className="flex flex-col justify-between gap-10 ml-5 sm:flex-row lg:col-span-2">
          <div>
            <h6 className="text-sm font-bold text-green-600">Information</h6>
            <ul>
              <li className="py-2 text-sm text-[#999999] text-green-500 hover:text-green-600">
                <Link to={"/products"}>Products</Link>
              </li>
              <li className="py-2 text-sm text-[#999999] text-green-500 hover:text-green-600">
                <Link to={"/about"}>About</Link>
              </li>
              <li className="py-2 text-sm text-[#999999] text-green-500 hover:text-green-600">
                <Link to={"/contact-us"}>Contacts Us</Link>
              </li>
            </ul>
          </div>
          {!auth && (
            <div>
              <h6 className="text-sm font-bold text-green-600">Support</h6>
              <ul>
                <li className="py-2 text-sm text-[#999999] text-green-500 hover:text-green-600">
                  <Link to={"/login"}>Login</Link>
                </li>
                <li className="py-2 text-sm text-[#999999] text-green-500 hover:text-green-600">
                  <Link to={"/signup"}>Signup</Link>
                </li>
                <li className="py-2 text-sm text-[#999999]">Licenses</li>
              </ul>
            </div>
          )}

          <div>
            <h6 className="text-sm font-bold text-green-600">Contact</h6>
            <ul>
              <span></span>
              <li className="py-2 text-sm text-[#999999]">info@gg.market</li>
              <span></span>
              <li className="py-2 text-sm text-[#999999]">+1 222 212 42222</li>
              <span></span>
              <li className="py-2 text-sm text-[#999999]">
                43 Raymouth Rd. Baltemoer, London 3910
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
