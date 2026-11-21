// Profile page: tab navigation + shared state only.
//
// The seven tabs used to live here (~1,340 lines). Each is now its own
// component under ./components/profile/ and owns its own state and API
// calls:
//   profile           -> EditProfile.jsx (edit profile + change password)
//   orders            -> MyOrders.jsx
//   become_an_expert  -> ExpertApplicationForm.jsx
//   products          -> MyProducts.jsx
//   badge             -> Badge.jsx
//   experts_list      -> ExpertsList.jsx (admin)
//   delete            -> DeactivateAccount.jsx
//
// Tab components mount when their tab is active, so their lists load on
// open — the same as the old viewProducts / viewOrders calls from the nav
// buttons. The dead View/Edit/Delete modal state the old file carried
// (imported and initialised but never rendered) is gone.
//
// Role gates use the stored user, not getAuthToken(): the token helper
// returns undefined since auth moved to an httpOnly cookie (security
// PR #1), so the old `auth && user.role === ...` checks never passed.
import { useState } from "react";
import { getAuthUser } from "../helper/Storage";
import { Link } from "react-router-dom";
import EditProfile from "../components/profile/EditProfile";
import MyOrders from "../components/profile/MyOrders";
import MyProducts from "../components/profile/MyProducts";
import ExpertApplicationForm from "../components/profile/ExpertApplicationForm";
import Badge from "../components/profile/Badge";
import ExpertsList from "../components/profile/ExpertsList";
import DeactivateAccount from "../components/profile/DeactivateAccount";

const Profile = () => {
  const user = getAuthUser();
  const [activeTab, setActiveTab] = useState("profile");
  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
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
          {user && (user.role === "user" || user.role === "expert") && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("orders")}
              >
                My Orders
              </button>
            </li>
          )}
          {user && user.role === "user" && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("become_an_expert")}
              >
                Reviewer Application
              </button>
            </li>
          )}
          {user && (user.role === "company" || user.role === "admin") && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("products")}
              >
                My Products
              </button>
            </li>
          )}
          {user && user.role === "company" && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("badge")}
              >
                Badge
              </button>
            </li>
          )}

          {user && user.role === "admin" && (
            <>
              <li>
                <button
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  onClick={() => {
                    handleButtonClick("experts_list");
                  }}
                >
                  Reviewers List
                </button>
              </li>
              <li>
                <Link
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  to={"/users"}
                >
                  Users List
                </Link>
              </li>
            </>
          )}
          <li>
            <button
              className="text-red-500 hover:text-red-600"
              onClick={() => handleButtonClick("delete")}
            >
              Deactivate My Account
            </button>
          </li>
        </ul>
      </div>
      <div className="lg:col-span-2">
        {activeTab === "profile" && <EditProfile user={user} />}
        {activeTab === "orders" &&
          user &&
          (user.role === "user" || user.role === "expert") && <MyOrders />}
        {activeTab === "become_an_expert" && <ExpertApplicationForm />}
        {activeTab === "products" &&
          user &&
          (user.role === "company" || user.role === "admin") && (
            <MyProducts user={user} />
          )}
        {activeTab === "badge" && user && user.role === "company" && <Badge />}
        {activeTab === "experts_list" && <ExpertsList />}
        {activeTab === "delete" && <DeactivateAccount />}
      </div>
    </section>
  );
};

export default Profile;
