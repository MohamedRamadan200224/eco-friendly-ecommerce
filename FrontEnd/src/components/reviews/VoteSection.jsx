// Comments / votes tab of the product page, extracted from Product.jsx.
//
// Owns everything about product votes (the "comments" tab): loading the
// list, submitting a vote/comment, updating / deleting one, and the
// report flag. Props are minimal and explicit:
//   productId  — the product being voted on (route param from Product.jsx)
//   user       — the logged-in user from getAuthUser(), or null
//   loadSignal — a number Product.jsx bumps every time the Comments tab is
//                clicked; this section loads on that signal, exactly like
//                the old showCom-on-tab-click behaviour.
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). No raw axios, no hardcoded backend URL, no Authorization
// header: the old `Bearer ${auth.jwtToken}` headers are gone — auth is
// the httpOnly cookie now, and getAuthToken() returns undefined anyway.
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import api, { userImageUrl } from "../../api/client";
import Pagination from "../Pagination";

const VoteSection = ({ productId, user, loadSignal }) => {
  const statusRef = useRef("fail");
  const [currentComPage, setCurrentComPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  const [editCom, setEditCom] = useState(false);

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

    setComment({ ...comment, loading: true });
    api
      .post(`/api/v1/products/${productId}/vote`, {
        comment: comment.comment,
        report: comment.report,
        user: user._id,
        product: productId,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComment({
          ...comment,
          status: resp.data.status,
          loading: false,
          reload: comment.reload + 1,
        });
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
    api
      .patch(voteEndpoint(revId), {
        comment: comment.comment,
        report: comment.report,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setComments({
          ...comments,
          status: resp.data.status,
          loading: false,
          reload: comments.reload + 1,
        });
        setEditCom(false);
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
        <ClipLoader
          className="color-cold-blue my-2"
          loading={true}
          size={70}
        />
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
                                  onClick={() => setEditCom(true)}
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
                          {editCom === true ? (
                            <div className=" w-full my-2 mx-2 items-center">
                              <button
                                onClick={() => setEditCom(false)}
                                className="float-right text-lg font-bold cursor-pointer text-red-400 hover:text-red-500"
                              >
                                X
                              </button>

                              <div>
                                <textarea
                                  name="comment"
                                  placeholder="Write your Review here"
                                  cols="30"
                                  rows="6"
                                  onChange={(e) =>
                                    setComment({
                                      ...comment,
                                      comment: e.target.value,
                                    })
                                  }
                                  className="w-full h-40 max-w-full min-w-full p-5 overflow-auto text-sm font-normal text-gray-600 normal-case whitespace-pre-wrap bg-white border rounded-md outline-none opacity-100 focus:text-gray-600 focus:opacity-100 focus:ring"
                                ></textarea>
                                {rev.report === true ? (
                                  <button
                                    type="submit"
                                    value="Post Comment"
                                    onClick={() =>
                                      setComment({
                                        ...comment,
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
                                      setComment({
                                        ...comment,
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
                                  value="Post Review"
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
                No Comments Added Yet
              </div>
            )}
          </ul>

          {user && user.role === "expert" && !hasCommented && (
            <div className="">
              <div className="max-w-screen-sm px-4 mx-auto">
                <h1 className="mt-6 text-xl font-bold sm:mb-6 sm:text-3xl text-cold-blue">
                  Write your Comments
                </h1>

                <div className="flex p-4 -ml-20 text-left text-gray-700">
                  <img
                    className="w-12 h-12 mr-5 rounded-full"
                    src="https://ui-avatars.com/api/?name=A+H"
                    alt=""
                  />
                  <div className="w-full space-y-3 text-gray-700">
                    <div className="">
                      <textarea
                        name="comment"
                        id=""
                        placeholder="Write your Comment here"
                        cols="30"
                        rows="6"
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
                        value="Post Comment"
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
