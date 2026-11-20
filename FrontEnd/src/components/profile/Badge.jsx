// "Badge" tab of the profile page (company only), extracted from Profile.jsx.
//
// No props: applying for the eco-friendly badge is a single self-contained
// call. All requests go through the shared api client (cookie auth, one
// shared error toast). No raw axios, no hardcoded backend URL, no
// Authorization header: the old `Bearer ${auth.jwtToken}` header is gone —
// auth is the httpOnly cookie now, and getAuthToken() returns undefined
// anyway.
import toast from "react-hot-toast";
import api from "../../api/client";

const Badge = () => {
  const applyBadge = (e) => {
    e.preventDefault();

    api
      .get(`/api/v1/applyCertificate`)
      .then((resp) => {
        if (resp.data.status === "success") {
          // Only claim what actually happens: the badge itself is granted
          // (isCertified is set). The certificate email is generated with
          // puppeteer, which cannot run on the Vercel hosting, so no email
          // is ever sent — the old toast implied otherwise.
          toast.success("Eco-Friendly Badge Granted!");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
      });
  };

  return (
    <div className="text-center lg:text-start">
      <p className="mb-3 text-cold-blue">
        You need to have sold at least
        <span className="text-xl font-semibold text-green-600">
          &nbsp;1 eco-friendly product&nbsp;
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
