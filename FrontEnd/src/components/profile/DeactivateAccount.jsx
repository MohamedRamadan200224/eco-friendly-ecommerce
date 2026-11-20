// "Deactivate My Account" tab of the profile page, extracted from
// Profile.jsx.
//
// No props: deactivation is a single self-contained call. All requests go
// through the shared api client (cookie auth, one shared error toast). No
// raw axios, no hardcoded backend URL, no Authorization header: the old
// `Bearer ${auth.jwtToken}` header is gone — auth is the httpOnly cookie
// now, and getAuthToken() returns undefined anyway.
import toast from "react-hot-toast";
import api from "../../api/client";

const DeactivateAccount = () => {
  const deleteUser = (e) => {
    e.preventDefault();

    api
      .patch(`/api/v1/users/deleteMe`)
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Account Is Successfully Deactivated!");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
      });
  };

  return (
    <div className="text-center lg:text-start">
      <p className="text-cold-blue">
        Are you sure you want to deactivate your account ?
      </p>
      <p className="mb-3 font-semibold text-cold-blue">
        All your data will be{" "}
        <span className="text-xl font-semibold text-red-600">
          Deactivated&nbsp;
        </span>
        !!
      </p>
      <button
        onClick={deleteUser}
        className="px-3 py-2 text-white hover:bg-red-600 bg-red-500 rounded-md"
      >
        Deactivate My Account
      </button>
    </div>
  );
};

export default DeactivateAccount;
