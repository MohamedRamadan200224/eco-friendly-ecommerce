import React, { useState } from "react";
import { TbViewportWide } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import ViewModal from "../components/ViewModal";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import { getAuthToken, getAuthUser } from "../helper/Storage";

const Profile = () => {
  const user = getAuthUser();
  const auth = getAuthToken();
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [activeTab, setActiveTab] = useState("profile");
  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
  };
  return (
    <>
      <section className="grid gap-10 lg:grid-cols-3 max-container padding-container lg:gap-0">
        <div className="text-center lg:text-start">
          <h1 className="text-xl font-bold text-green-600 underline">
            Manage My Account
          </h1>
          <ul className="mt-10 text-lg leading-loose text-cold-blue">
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("profile")}
              >
                My Profile
              </button>
            </li>
            {auth && user.role === "user" && (
              <li>
                <button
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  onClick={() => handleButtonClick("orders")}
                >
                  My Orders
                </button>
              </li>
            )}
            {auth && user.role === "company" && (
              <li>
                <button
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  onClick={() => handleButtonClick("products")}
                >
                  My Products
                </button>
              </li>
            )}
            {auth && user.role === "company" && (
              <li>
                <button
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  onClick={() => handleButtonClick("badge")}
                >
                  Badge
                </button>
              </li>
            )}
            <li>
              <button
                className="text-red-500"
                onClick={() => handleButtonClick("delete")}
              >
                Delete My Account
              </button>
            </li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          {/* tabs for users and company */}
          {activeTab === "profile" && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-green-600">
                Edit Your Profile
              </h2>
              <div className="flex flex-col">
                <label className="mt-3">Username</label>
                <input
                  type="text"
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                  name="user"
                  required
                />
                <label className="mt-3">Email</label>
                <input
                  type="email"
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                  name="email"
                  required
                />
                <select
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px] mt-3"
                  required
                >
                  <option selected>Choose a role</option>
                  <option value="user">User</option>
                  <option value="company">Company</option>
                </select>
                <div className="flex flex-col gap-4 mt-10">
                  <label>Password Changes</label>
                  <input
                    type="password"
                    className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                    placeholder="Current Password"
                    name="pass1"
                    required
                  />
                  <input
                    type="password"
                    className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                    placeholder="New Password"
                    name="pass1"
                    required
                  />
                  <input
                    type="password"
                    className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                    placeholder="Confirm New Password"
                    name="pass2"
                    required
                  />
                </div>

                <input
                  type="submit"
                  className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3"
                  value="Apply"
                />
              </div>
            </div>
          )}

          {auth && user.role === "user" && activeTab === "orders" && (
            <div className="flex flex-col justify-between gap-3 px-2 py-2 border rounded-md xs:flex-row border-cold-blue">
              <div className="flex items-center gap-2">
                <img
                  src="https://dummyimage.com/30x30"
                  alt=""
                  width={30}
                  height={30}
                />
                <p>Product Name</p>
              </div>

              <div className="flex gap-3">
                {/* Buttons for Users, Company and admin */}
                <button
                  className="px-2 py-2 rounded-md bg-cold-blue"
                  onClick={() => setShowViewModal(true)}
                >
                  <TbViewportWide color="white" />
                </button>
                {showViewModal == true && (
                  <ViewModal onClose={() => setShowViewModal(false)} />
                )}
                {/* Buttons for Company */}
                <button
                  className="px-2 py-2 rounded-md bg-cold-blue"
                  onClick={() => setShowEditModal(true)}
                >
                  <MdEdit color="white" />
                </button>
                {showEditModal == true && (
                  <EditModal onClose={() => setShowEditModal(false)} />
                )}
                <button
                  className="px-2 py-2 bg-red-600 rounded-md"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <MdDelete color="white" />
                </button>
                {showDeleteModal == true && (
                  <DeleteModal onClose={() => setShowDeleteModal(false)} />
                )}
              </div>
            </div>
          )}

          {auth && user.role === "company" && activeTab === "products" && (
            <div className="flex flex-col justify-between gap-3 px-2 py-2 border rounded-md xs:flex-row border-cold-blue">
              <div className="flex items-center gap-2">
                <img
                  src="https://dummyimage.com/30x30"
                  alt=""
                  width={30}
                  height={30}
                />
                <p>Product Name</p>
              </div>

              <div className="flex gap-3">
                {/* Buttons for Users, Company and admin */}
                <button
                  className="px-2 py-2 rounded-md bg-cold-blue"
                  onClick={() => setShowViewModal(true)}
                >
                  <TbViewportWide color="white" />
                </button>
                {showViewModal == true && (
                  <ViewModal onClose={() => setShowViewModal(false)} />
                )}
                {/* Buttons for Company */}
                <button
                  className="px-2 py-2 rounded-md bg-cold-blue"
                  onClick={() => setShowEditModal(true)}
                >
                  <MdEdit color="white" />
                </button>
                {showEditModal == true && (
                  <EditModal onClose={() => setShowEditModal(false)} />
                )}
                <button
                  className="px-2 py-2 bg-red-600 rounded-md"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <MdDelete color="white" />
                </button>
                {showDeleteModal == true && (
                  <DeleteModal onClose={() => setShowDeleteModal(false)} />
                )}
              </div>
            </div>
          )}

          {auth && user.role === "company" && activeTab === "badge" && (
            <div className="text-center lg:text-start">
              <p className="mb-3 text-cold-blue">
                You need to purchase at least
                <span className="text-xl font-semibold text-green-600">
                  &nbsp;2 eco-friendly products&nbsp;
                </span>
                to apply for this badge.
              </p>
              <button className="px-3 py-2 text-white duration-300 ease-in-out rounded-md bg-cold-blue hover:bg-mint hover:text-cold-blue">
                Apply for Eco-Friendly Badge
              </button>
            </div>
          )}

          {activeTab === "delete" && (
            <div className="text-center lg:text-start">
              <p className="text-cold-blue">
                Are you sure you want to delete your account ?
              </p>
              <p className="mb-3 font-semibold text-cold-blue">
                All your data will be{" "}
                <span className="text-xl font-semibold text-red-600">
                  deleted&nbsp;
                </span>
                !!
              </p>
              <button className="px-3 py-2 text-white bg-red-600 rounded-md">
                Delete My Account
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Profile;
