// Reviewer verifications tab of the product page, extracted from
// Product.jsx.
//
// Owns everything about product verifications (votes): loading the list,
// submitting a verification, updating / deleting one, and the report
// flag. A verification is a reviewer's (role 'expert') comment + report
// flag on a product's eco-friendliness — it feeds the product's
// reportsNumber / noReportsNumber and harmfultoenv. Props are minimal
// and explicit:
//   productId  — the product being verified (route param from Product.jsx)
//   user       — the logged-in user from getAuthUser(), or null
//   loadSignal — a number Product.jsx bumps every time the Verifications
//                tab is clicked; this section loads on that signal,
//                exactly like the old showCom-on-tab-click behaviour.
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). No raw axios, no hardcoded backend URL, no Authorization
// header: the old `Bearer ${auth.jwtToken}` headers are gone — auth is
// the httpOnly cookie now, and getAuthToken() returns undefined anyway.
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import EcoLoader from "../EcoLoader";
import api, { userImageUrl, handleImgError } from "../../api/client";
import Pagination from "../Pagination";

const VoteSection = ({ productId, user, loadSignal }) => {
  const statusRef = useRef("fail");
  const [currentComPage, setCurrentComPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  // Per-verification edit state (not one global boolean): opening the
  // edit box on one verification must not open it on every verification
  // at once. The edit form's own state is prefilled from the
  // verification being edited — the old code sent the *create-form*
  // state on update, so saving an edit sent empty text unless the user
  // re-typed it in the create box.
  const [editingVoteId, setEditingVoteId] = useState(null);
  const [editForm, setEditForm] = useState({ comment: "", report: false });

  const openEdit = (rev) => {
    setEditingVoteId(rev._id);
    setEditForm({ comment: rev.comment, report: rev.report });
  };

  const closeEdit = () => {
    setEditingVoteId(null);
    setEditForm({ comment: "", report: false });
  };

  const [comments, setComments] = useState({
    results: [],
    loading: true,
    status: "fail",
    reload: 0,
  });
  const [comment, setComment] = useState({
    comment: "",
    report: false,
    loading: false,
    status: "fail",
    reload: 0,
  });

  const showCom = () => {
    if (!productId) return;
    setComments({ ...comments, loading: true });
    api
      .get(`/api/v1/products/${productId}/vote`)
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComments({
          ...comments,
          results: resp.data.data.data,
          status: resp.data.status,
          loading: false,
          reload: comments.reload + 1,
        });

        if (resp.data.status === "fail") {
          toast.error(resp.data.message);
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setComments({
          ...comments,
          status: statusRef.current,
          loading: false,
          reload: comments.reload + 1,
        });
      });
  };

  // Loads only when Product.jsx signals a tab click (loadSignal starts at
  // 0, so nothing loads until the user opens the Comments tab).
  useEffect(() => {
    if (loadSignal === 0) return;
    showCom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSignal]);

  const HandleComment = (e) => {
    e.preventDefault();

    // Client-side validation: the backend requires a non-empty comment.
    if (!comment.comment.trim()) {
      toast.error("Please write your verification first.");
      return;
    }

    setComment({ ...comment, loading: true });
    // User and product are server-derived now (the backend takes them
    // from the login + the URL); sending them in the body was the trust
    // bug fixed in createReview / createVote.
    api
      .post(`/api/v1/products/${productId}/vote`, {
        comment: comment.comment,
        report: comment.report,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComment({
          comment: "",
          report: false,
          status: resp.data.status,
          loading: false,
          reload: comment.reload + 1,
        });
        toast.success("Verification posted successfully.");
        showCom();
      })
      .catch(() => {
        setComment({
          ...comment,
          status: statusRef.current,
          loading: false,
          reload: comment.reload + 1,
        });
      });
  };

  // Admins hit the admin route, everyone else their own-vote route.
  const voteEndpoint = (revId) =>
    user && user.role === "admin"
      ? `/api/v1/votes/${revId}`
      : `/api/v1/votes/myVote/${revId}`;

  const updateComment = (e, revId) => {
    e.preventDefault();
    // Validate and send the *edit* form's own state (see openEdit): the
    // old code sent the create-form state, which is empty on a fresh page
    // load, so the PATCH failed the schema's non-empty comment rule.
    if (!editForm.comment.trim()) {
      toast.error("Please write your verification first.");
      return;
    }
    api
      .patch(voteEndpoint(revId), {
        comment: editForm.comment,
        report: editForm.report,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComments({
          ...comments,
          status: resp.data.status,
          loading: false,
          reload: comments.reload + 1,
        });
        closeEdit();
        toast.success("Verification updated successfully.");
        // Refresh the list: without this the updated verification kept
        // showing its old text until the tab was clicked again.
        showCom();
      })
      .catch(() => {
        setComments({
          ...comments,
          status: statusRef.current,
          loading: false,
          reload: comments.reload + 1,
        });
      });
  };

  const deleteComment = (e, revId) => {
    e.preventDefault();
    api
      .delete(voteEndpoint(revId))
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComments({
          ...comments,
          status: resp.data.status,
          loading: false,
          reload: comments.reload + 1,
        });
        toast.success("Verification deleted successfully.");
        showCom();
      })
      .catch(() => {
        setComments({
          ...comments,
          status: statusRef.current,
          loading: false,
          reload: comments.reload + 1,
        });
      });
  };

  const indexOfLastComment = currentComPage * reviewsPerPage;
  const indexOfFirstComment = indexOfLastComment - reviewsPerPage;
  const currentComments = comments.results.slice(
    indexOfFirstComment,
    indexOfLastComment
  );
  const paginateCom = (pageNumber) => setCurrentComPage(pageNumber);

  // The write form hides once the user already voted — derived from the
  // loaded list. (The old code set the *review* flag here by mistake
  // — `userReviewed.current = true` inside the comments render — so the
  // gate never actually worked; this is the intended behaviour.)
  const hasCommented =
    user &&
    comments.results.some(
      (rev) => rev.user && rev.user._id === user._id
    );

  return (
    <>
      {(comments.loading === true || comment.loading === true) && (
        <EcoLoader label="Watering the verifications…" />
      )}

      {comments.loading === false && (
        <div>
          <ul className="">
            {comments.results.length > 0 ? (
              currentComments.map((rev) => {
                const userIsCommenter =
                  user && rev.user && rev.user._id === user._id;
                return (
                  <li
                    className="px-4 py-8 m-2 text-left border"
                    key={rev._id}
                  >
                    <div className="flex items-start">
                      <img
                        className="flex-shrink-0 block w-10 h-10 max-w-full align-middle rounded-full"
                        src={userImageUrl(rev.user && rev.user.photo)}
                        onError={handleImgError(
                          rev.user && rev.user.name,
                          "person"
                        )}
                        alt=""
                      />
                      <div className="ml-6">
                        <div className="flex flex-col">
                          <div className="flex items-center mt-5">
                            <p className="text-xl font-bold text-green-500">
                              {rev.user && rev.user.name}
                            </p>
                            {rev.report === true && (
                              <div className="relative inline-flex mx-3 items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-red-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring">
                                Reported
                              </div>
                            )}

                            {(userIsCommenter ||
                              (user && user.role === "admin")) && (
                              <>
                                <button
                                  onClick={() => openEdit(rev)}
                                  className="text-md font-bold cursor-pointer hover:text-green-600 text-green-500 ml-4"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={(e) => deleteComment(e, rev._id)}
                                  className="text-lg font-bold cursor-pointer hover:text-red-600 text-red-500 ml-4"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                          {editingVoteId === rev._id ? (
                            <div className=" w-full my-2 mx-2 items-center">
                              <button
                                onClick={closeEdit}
                                className="float-right text-lg font-bold cursor-pointer text-red-400 hover:text-red-500"
                              >
                                X
                              </button>

                              <div>
                                <textarea
                                  name="comment"
                                  placeholder="Write your verification here"
                                  cols="30"
                                  rows="6"
                                  value={editForm.comment}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      comment: e.target.value,
                                    })
                                  }
                                  className="w-full h-40 max-w-full min-w-full p-5 overflow-auto text-sm font-normal text-gray-600 normal-case whitespace-pre-wrap bg-white border rounded-md outline-none opacity-100 focus:text-gray-600 focus:opacity-100 focus:ring"
                                ></textarea>
                                {editForm.report === true ? (
                                  <button
                                    type="submit"
                                    value="Post Comment"
                                    onClick={() =>
                                      setEditForm({
                                        ...editForm,
                                        report: false,
                                      })
                                    }
                                    className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                                  >
                                    Remove Report
                                  </button>
                                ) : (
                                  <button
                                    type="submit"
                                    value="Post Comment"
                                    onClick={() =>
                                      setEditForm({
                                        ...editForm,
                                        report: true,
                                      })
                                    }
                                    className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-red-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                                  >
                                    Report
                                  </button>
                                )}
                              </div>

                              <div className="float-right">
                                <input
                                  type="submit"
                                  value="Update Verification"
                                  onClick={(e) => {
                                    updateComment(e, rev._id);
                                  }}
                                  className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mt-5 text-base font-bold text-gray-900">
                                {rev.comment}
                              </p>
                              <p className="mt-1 font-bold text-sm text-gray-600">
                                {rev.createdAt && rev.createdAt.split("T", 1)[0]}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })
            ) : (
              <div className="inline-flex items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
                No Verifications Added Yet
              </div>
            )}
          </ul>

          {user && user.role === "expert" && !hasCommented && (
            <div className="">
              <div className="max-w-screen-sm px-4 mx-auto">
                <h1 className="mt-6 text-xl font-bold sm:mb-6 sm:text-3xl text-cold-blue">
                  Write your Verification
                </h1>

                <div className="flex p-4 -ml-20 text-left text-gray-700">
                  {/* The logged-in reviewer's photo, not a hardcoded
                      ui-avatars.com "A H" placeholder. */}
                  <img
                    className="w-12 h-12 mr-5 rounded-full"
                    src={userImageUrl(user && user.photo)}
                    onError={handleImgError(user && user.name, "person")}
                    alt=""
                  />
                  <div className="w-full space-y-3 text-gray-700">
                    <div className="">
                      <textarea
                        name="comment"
                        id=""
                        placeholder="Write your verification here"
                        cols="30"
                        rows="6"
                        value={comment.comment}
                        onChange={(e) =>
                          setComment({
                            ...comment,
                            comment: e.target.value,
                          })
                        }
                        className="w-full h-40 max-w-full min-w-full p-5 overflow-auto text-sm font-normal text-gray-600 normal-case whitespace-pre-wrap bg-white border rounded-md outline-none opacity-100 focus:text-gray-600 focus:opacity-100 focus:ring"
                      ></textarea>
                    </div>
                    <div className="float-right">
                      <button
                        type="submit"
                        value="Post Comment"
                        onClick={() =>
                          setComment({ ...comment, report: true })
                        }
                        className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-red-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                      >
                        Report
                      </button>
                      <input
                        type="submit"
                        value="Post Verification"
                        onClick={HandleComment}
                        className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <Pagination
            reviewsPerPage={reviewsPerPage}
            totalReviews={comments.results.length}
            paginate={paginateCom}
          />
        </div>
      )}
    </>
  );
};

export default VoteSection;
