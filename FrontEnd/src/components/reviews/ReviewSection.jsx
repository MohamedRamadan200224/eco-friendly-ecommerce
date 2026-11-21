// Reviews tab of the product page, extracted from Product.jsx.
//
// Owns everything about product reviews: loading the list, submitting a
// review, updating / deleting one. Props are minimal and explicit:
//   productId  — the product being reviewed (route param from Product.jsx)
//   user       — the logged-in user from getAuthUser(), or null
//   loadSignal — a number Product.jsx bumps every time the Reviews tab is
//                clicked; this section loads on that signal, exactly like
//                the old showRev-on-tab-click behaviour.
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

const totalStars = 5;

const ReviewSection = ({ productId, user, loadSignal }) => {
  const statusRef = useRef("fail");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentRevPage, setCurrentRevPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  // Per-review edit state (not one global boolean): opening the edit box
  // on one review must not open it on every review at once.
  const [editingRevId, setEditingRevId] = useState(null);
  // The edit form's own state, prefilled from the review being edited.
  // The old code sent the *create-form* state (rating 0, review "") on
  // update, so saving an edit failed validation unless the user re-typed
  // the whole text and re-clicked the stars.
  const [editForm, setEditForm] = useState({ review: "", rating: 0 });

  const openEdit = (rev) => {
    setEditingRevId(rev._id);
    setEditForm({ review: rev.review, rating: rev.rating });
    setRating(rev.rating);
  };

  const closeEdit = () => {
    setEditingRevId(null);
    setEditForm({ review: "", rating: 0 });
    setRating(0);
    setHoverRating(0);
  };

  const [reviews, setReviews] = useState({
    results: [],
    loading: true,
    status: "fail",
    reload: 0,
  });
  const [review, setReview] = useState({
    review: "",
    rating: 0,
    loading: false,
    status: "fail",
    reload: 0,
  });

  const showRev = () => {
    if (!productId) return;
    setReviews({ ...reviews, loading: true });
    api
      .get(`/api/v1/products/${productId}/review`)
      .then((resp) => {
        statusRef.current = resp.data.status;
        setReviews({
          ...reviews,
          results: resp.data.data.data,
          status: resp.data.status,
          loading: false,
          reload: reviews.reload + 1,
        });

        if (resp.data.status === "fail") {
          toast.error(resp.data.message);
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setReviews({
          ...reviews,
          status: statusRef.current,
          loading: false,
          reload: reviews.reload + 1,
        });
      });
  };

  // Loads only when Product.jsx signals a tab click (loadSignal starts at
  // 0, so nothing loads until the user opens the Reviews tab).
  useEffect(() => {
    if (loadSignal === 0) return;
    showRev();
    checkPurchase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSignal]);

  // Buyer gate: only a buyer with a PAID order containing this product
  // may post a review. Reuses the existing GET /api/v1/myOrders (no new
  // endpoint): the response shape is { orders: [...] } with populated
  // products. This is only the UI gate — the backend enforces the same
  // check in createReview, so a forged request still gets a 403.
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);

  const checkPurchase = () => {
    if (!user || user.role !== "user" || !productId) {
      setPurchaseChecked(true);
      return;
    }
    api
      .get(`/api/v1/myOrders`)
      .then((resp) => {
        const orders = resp.data.orders || [];
        const bought = orders.some(
          (order) =>
            order.paymentStatus === "paid" &&
            (order.products || []).some((item) => {
              const p = item.product;
              return String((p && p._id) || p) === String(productId);
            })
        );
        setHasPurchased(bought);
        setPurchaseChecked(true);
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        // Treat as "not verified as a buyer" — the backend enforces
        // the purchase check anyway.
        setPurchaseChecked(true);
      });
  };

  const HandleSubmit = (e) => {
    e.preventDefault();

    // Client-side validation: the backend requires rating >= 1 and a
    // non-empty review, so check before posting instead of failing
    // silently (the old code posted rating 0 / "" and only the error
    // toast said anything).
    if (review.rating < 1) {
      toast.error("Please pick a star rating first.");
      return;
    }
    if (!review.review.trim()) {
      toast.error("Please write your review first.");
      return;
    }

    setReview({ ...review, loading: true });
    // User and product are server-derived now (the backend takes them
    // from the login + the URL); sending them in the body was the trust
    // bug fixed in createReview.
    api
      .post(`/api/v1/products/${productId}/review`, {
        review: review.review,
        rating: review.rating,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setReview({
          ...review,
          status: resp.data.status,
          loading: false,
          reload: review.reload + 1,
        });
        toast.success("Review posted successfully.");
        showRev();
      })
      .catch(() => {
        setReview({
          ...review,
          status: statusRef.current,
          loading: false,
          reload: review.reload + 1,
        });
      });
  };

  // Admins hit the admin route, everyone else their own-review route.
  const reviewEndpoint = (revId) =>
    user && user.role === "admin"
      ? `/api/v1/reviews/${revId}`
      : `/api/v1/reviews/myReview/${revId}`;

  const deleteReview = (e, revId) => {
    e.preventDefault();
    api
      .delete(reviewEndpoint(revId))
      .then((resp) => {
        statusRef.current = resp.data.status;
        setReviews({
          ...reviews,
          status: resp.data.status,
          loading: false,
          reload: reviews.reload + 1,
        });
        setRating(0);
        setHoverRating(0);
        toast.success("Review deleted successfully.");
        // Refresh the list: the old code only set state and never
        // re-fetched, so the deleted review stayed on screen and the
        // user concluded the delete had not worked.
        showRev();
      })
      .catch(() => {
        setReviews({
          ...reviews,
          status: statusRef.current,
          loading: false,
          reload: reviews.reload + 1,
        });
      });
  };

  const updateReview = (e, revId) => {
    e.preventDefault();
    // Validate the *edit* form's own state (see openEdit): the old code
    // sent the create-form state, which is rating 0 / "" on a fresh page
    // load, so the PATCH failed the schema's rating >= 1 / non-empty
    // review rules.
    if (editForm.rating < 1) {
      toast.error("Please pick a star rating first.");
      return;
    }
    if (!editForm.review.trim()) {
      toast.error("Please write your review first.");
      return;
    }
    api
      .patch(reviewEndpoint(revId), {
        rating: editForm.rating,
        review: editForm.review,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
        setReviews({
          ...reviews,
          status: resp.data.status,
          loading: false,
          reload: reviews.reload + 1,
        });
        closeEdit();
        toast.success("Review updated successfully.");
        // Refresh the list: without this the updated review kept showing
        // its old text until the tab was clicked again.
        showRev();
      })
      .catch(() => {
        setReviews({
          ...reviews,
          status: statusRef.current,
          loading: false,
          reload: reviews.reload + 1,
        });
      });
  };

  const indexOfLastReview = currentRevPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.results.slice(
    indexOfFirstReview,
    indexOfLastReview
  );
  const paginateRev = (pageNumber) => setCurrentRevPage(pageNumber);

  // The write form hides once the user already reviewed — derived from the
  // loaded list instead of mutating a ref during render (the old code did
  // that inside the .map() below).
  const hasReviewed =
    user &&
    reviews.results.some(
      (rev) => rev.user && rev.user._id === user._id
    );

  return (
    <>
      {(reviews.loading === true || review.loading === true) && (
        <EcoLoader label="Watering the reviews…" />
      )}

      {reviews.loading === false && (
        <div>
          <ul className="">
            {reviews.results.length > 0 ? (
              currentReviews.map((rev) => {
                const userIsReviewer =
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
                          <div className="flex">
                            {[...Array(totalStars)].map((star, i) => {
                              const ratingValue = i + 1;
                              return (
                                <label key={i}>
                                  <svg
                                    className={`w-6 h-6 block align-middle ${
                                      ratingValue <= rev.rating
                                        ? "text-yellow-500"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                  </svg>
                                </label>
                              );
                            })}
                          </div>
                          <div className="flex items-center mt-5">
                            <p className="text-xl font-bold text-green-500">
                              {rev.user && rev.user.name}
                            </p>
                            {(userIsReviewer ||
                              (user && user.role === "admin")) && (
                              <>
                                <button
                                  onClick={() => openEdit(rev)}
                                  className="text-md font-bold cursor-pointer hover:text-green-600 text-green-500 ml-4"
                                >
                                  Update
                                </button>
                                <button
                                  onClick={(e) => deleteReview(e, rev._id)}
                                  className="text-lg font-bold cursor-pointer hover:text-red-600 text-red-500 ml-4"
                                >
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                          {editingRevId === rev._id ? (
                            <div className=" w-full my-2 mx-2 items-center">
                              <button
                                onClick={closeEdit}
                                className="float-right text-lg font-bold cursor-pointer text-red-400 hover:text-red-500"
                              >
                                X
                              </button>
                              <div className="flex my-2">
                                {[...Array(5)].map((star, i) => {
                                  const ratingValue = i + 1;
                                  return (
                                    <svg
                                      key={i}
                                      className={`block w-6 h-6 text-gray-400 align-middle hover:text-yellow-500 ${
                                        ratingValue <=
                                        (hoverRating || editForm.rating)
                                          ? "text-yellow-500"
                                          : ""
                                      }`}
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      onMouseEnter={() =>
                                        setHoverRating(ratingValue)
                                      }
                                      onMouseLeave={() => setHoverRating(0)}
                                      onClick={() => {
                                        setRating(ratingValue);
                                        setEditForm({
                                          ...editForm,
                                          rating: ratingValue,
                                        });
                                      }}
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>
                                  );
                                })}
                              </div>

                              <div>
                                <textarea
                                  name="comment"
                                  placeholder="Write your Review here"
                                  cols="30"
                                  rows="6"
                                  value={editForm.review}
                                  onChange={(e) =>
                                    setEditForm({
                                      ...editForm,
                                      review: e.target.value,
                                    })
                                  }
                                  className="w-full h-40 max-w-full min-w-full p-5 overflow-auto text-sm font-normal text-gray-600 normal-case whitespace-pre-wrap bg-white border rounded-md outline-none opacity-100 focus:text-gray-600 focus:opacity-100 focus:ring"
                                ></textarea>
                              </div>

                              <div className="float-right">
                                <input
                                  type="submit"
                                  value="Post Review"
                                  onClick={(e) => {
                                    updateReview(e, rev._id);
                                  }}
                                  className="relative inline-flex items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                                />
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mt-5 text-base font-bold text-gray-900">
                                {rev.review}
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
                No Reviews Added Yet
              </div>
            )}
          </ul>

          {user &&
            user.role === "user" &&
            !hasReviewed &&
            purchaseChecked &&
            !hasPurchased && (
              <div className="inline-flex items-center justify-center px-4 py-3 m-2 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
                Only buyers who purchased this product can review it.
              </div>
            )}

          {user && user.role === "user" && !hasReviewed && hasPurchased && (
            <div className="">
              <div className="max-w-screen-sm px-4 mx-auto">
                <h1 className="mt-6 text-xl font-bold sm:mb-6 sm:text-3xl text-cold-blue">
                  Write your Review
                </h1>
                <div className="flex items-center">
                  {[...Array(5)].map((star, i) => {
                    const ratingValue = i + 1;

                    return (
                      <svg
                        key={i}
                        className={`block w-6 h-6 text-gray-400 align-middle hover:text-yellow-500 ${
                          ratingValue <= (hoverRating || rating)
                            ? "text-yellow-500"
                            : ""
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => {
                          setRating(ratingValue);
                          setReview({ ...review, rating: ratingValue });
                        }}
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    );
                  })}
                </div>

                <div className="flex p-4 -ml-20 text-left text-gray-700">
                  {/* The logged-in user's photo, not a hardcoded
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
                        placeholder="Write your Review here"
                        cols="30"
                        rows="6"
                        onChange={(e) =>
                          setReview({
                            ...review,
                            review: e.target.value,
                          })
                        }
                        className="w-full h-40 max-w-full min-w-full p-5 overflow-auto text-sm font-normal text-gray-600 normal-case whitespace-pre-wrap bg-white border rounded-md outline-none opacity-100 focus:text-gray-600 focus:opacity-100 focus:ring"
                      ></textarea>
                    </div>
                    <div className="float-right">
                      <input
                        type="submit"
                        value="Post Review"
                        onClick={HandleSubmit}
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
            totalReviews={reviews.results.length}
            paginate={paginateRev}
          />
        </div>
      )}
    </>
  );
};

export default ReviewSection;
