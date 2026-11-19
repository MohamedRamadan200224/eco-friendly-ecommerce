// "Badge" tab of the profile page (company only), extracted from Profile.jsx.
//
// No props: applying for the eco-friendly badge is a single self-contained
// call. All requests go through the shared api client (cookie auth, one
// shared error toast). No raw axios, no hardcoded backend URL, no
// Authorization header: the old `Bearer ${auth.jwtToken}` header is gone —
// auth is the httpOnly cookie now, and getAuthToken() returns undefined
// anyway.
import React from "react";
import toast from "react-hot-toast";
import api from "../../api/client";

const Badge = () => {
  const applyBadge = (e) => {
    e.preventDefault();

    api
      .get(`/api/v1/applyCertificate`)
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Applied For Badge Successfully");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
      });
  };

  return (
    <div className="text-center lg:text-start">
      <p className="mb-3 text-cold-blue">
        You need to purchase at least
        <span className="text-xl font-semibold text-green-600">
          &nbsp;2 eco-friendly products&nbsp;
        </span>
        to apply for this badge.
      </p>
      <button
        onClick={applyBadge}
        className="px-3 py-2 text-white duration-300 ease-in-out rounded-md bg-cold-blue hover:bg-mint hover:text-cold-blue"
      >
        Apply for Eco-Friendly Badge
      </button>
    </div>
  );
};

export default Badge;
