// "Experts List" tab of the profile page (admin only), extracted from
// Profile.jsx.
//
// Fetches expert applications and lets an admin approve / reject / delete
// them, through the shared useApiList hook (fetch / search / paginate).
// No props: the endpoint is admin-scoped and the list is self-contained.
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). No raw axios, no hardcoded backend URL, no Authorization
// header: the old `Bearer ${auth.jwtToken}` headers are gone — auth is
// the httpOnly cookie now, and getAuthToken() returns undefined anyway.
//
// Note: the old searchApplications() was broken — it called
// `searchApps.values(item).some(...)`, and Array.prototype.values() takes
// no argument and returns an iterator with no .some(), so searching the
// list threw. The hook's null-safe search over applicationStatus plus
// the applicant's name / email replaces it.
import { useState } from "react";
import { MdDelete } from "react-icons/md";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import EcoLoader from "../EcoLoader";
import toast from "react-hot-toast";
import api from "../../api/client";
import { useApiList } from "../../hooks/useApiList";
import Pagination from "../Pagination";
import ExpertsModal from "../ExpertsModal";

const ExpertsList = () => {
  const [showExpertsModal, setShowExpertsModal] = useState(false);
  const [modalAppId, setModalAppId] = useState(null);

  const applications = useApiList({
    load: () =>
      api.get(`/api/v1/expertApply`).then((resp) => resp.data.data),
    searchFields: ["applicationStatus", "user.name", "user.email"],
  });

  const deleteApplication = (e, applicationId) => {
    e.preventDefault();
    api
      .delete(`/api/v1/expertApply/${applicationId}`)
      .then(() => {
        toast.success("Expert Application is Successfully Deleted");
        applications.reload();
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        applications.reload();
      });
  };

  const reviewApplication = (e, applicationId, decision) => {
    e.preventDefault();
    api
      .patch(`/api/v1/expertApply/${applicationId}`, {
        applicationStatus: decision,
      })
      .then(() => {
        toast.success(
          `User's Expert Application Is Successfully ${decision}`
        );
        applications.reload();
      })
      .catch(() => {
        applications.reload();
      });
  };

  return (
    <>
      {applications.loading === true && (
        <EcoLoader label="Loading applications…" />
      )}

      {applications.loading === false && applications.results.length === 0 && (
        <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
          There are no applications yet
        </div>
      )}

      {applications.loading === false && applications.currentItems.length > 0 && (
        <section className="max-container padding-container">
          <div className="max-w-screen-lg px-4 py-8 mx-auto sm:px-8">
            <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
              <label htmlFor="search-form">
                <input
                  type="search"
                  name="search-form"
                  id="search-form"
                  className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
                  placeholder="Search for Applications..."
                  value={applications.q}
                  onChange={(e) => applications.setQ(e.target.value)}
                />
              </label>
            </div>
            <div className="flex items-center justify-between pb-6">
              <div>
                <h2 className="text-xl font-semibold text-green-600">
                  Experts List
                </h2>
              </div>
              <div className="flex items-center justify-between">
                <div className="ml-10 space-x-8 lg:ml-40"></div>
              </div>
            </div>
            <div className="overflow-y-hidden border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-xs font-semibold tracking-widest text-left text-white uppercase bg-green-600">
                      <th className="px-5 py-3">Application ID</th>
                      <th className="px-5 py-3">Full Name</th>
                      <th className="px-5 py-3">Email</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-500">
                    {applications.currentItems.map((application) => (
                      <tr key={application._id}>
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <p className="whitespace-no-wrap">
                            {application._id}
                          </p>
                        </td>
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10"></div>
                            <div className="ml-3">
                              <p className="whitespace-no-wrap">
                                {application.user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <p className="whitespace-no-wrap">
                            {application.user.email}
                          </p>
                        </td>
                        {application.user.active === true ? (
                          <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                            <p className="whitespace-no-wrap text-green-500">
                              ACTIVE
                            </p>
                          </td>
                        ) : (
                          <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                            <p className="whitespace-no-wrap text-black">
                              INACTIVE
                            </p>
                          </td>
                        )}

                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <div className="flex space-x-2">
                            <button
                              className="text-blue-500 hover:text-blue-700"
                              onClick={() => {
                                setModalAppId(application._id);
                                setShowExpertsModal(true);
                              }}
                            >
                              <FaEye size={24} />
                            </button>
                            {showExpertsModal &&
                              modalAppId === application._id && (
                                <ExpertsModal
                                  appId={application._id}
                                  onClose={() => setShowExpertsModal(false)}
                                />
                              )}
                            <button
                              className="text-green-500 hover:text-green-700"
                              onClick={(e) => {
                                reviewApplication(
                                  e,
                                  application._id,
                                  "approved"
                                );
                              }}
                            >
                              <FaCheck size={24} />
                            </button>
                            <button
                              onClick={(e) => {
                                reviewApplication(
                                  e,
                                  application._id,
                                  "rejected"
                                );
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTimes size={24} />
                            </button>
                            <button
                              className="text-xl"
                              onClick={(e) => {
                                deleteApplication(e, application._id);
                              }}
                            >
                              <MdDelete color="red" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              reviewsPerPage={10}
              totalReviews={applications.results.length}
              paginate={applications.paginate}
            />
          </div>
        </section>
      )}
    </>
  );
};

export default ExpertsList;
