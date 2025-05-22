import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";
import Skeleton from "react-loading-skeleton";
import { ClipLoader } from "react-spinners";
import Pagination from "./Pagination";
import { getProductById } from "../mockData/products";
import { isDevelopment } from "../utils/environment";
const Product = () => {
  const user = getAuthUser();
  let respStatus1 = useRef("fail");
  const userReviewed = useRef(false);

  const userCommented = useRef(false);
  const [rating, setRating] = useState(0);
  const [currentRevPage, setCurrentRevPage] = useState(1);
  const [currentComPage, setCurrentComPage] = useState(1);
  const [reviewsPerPage] = useState(10);
  let respStatus2 = useRef("fail");
  const auth = getAuthToken();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  const [hoverRating, setHoverRating] = useState(0);
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

  const [editRev, setEditRev] = useState(false);

  const [addCart, setAddCart] = useState({
    quantity: 0,
    loading: true,
    status: "fail",
    reload: 0,
  });

  const totalStars = 5;

  const [product, setProduct] = useState({
    result: "",
    loading: false,
    status: "fail",
  });
  useEffect(() => {
    setProduct({ ...product, loading: true });
    if (isDevelopment()) {
      // Use mock data in development
      const mockResponse = getProductById(id);
      
      if (mockResponse.status === "success") {
        setProduct({
          ...product,
          result: mockResponse.data.data,
          status: mockResponse.status,
          loading: false,
        });
      } else {
        toast.error(mockResponse.message);
        setProduct({
          ...product,
          status: "fail",
          loading: false,
        });
      }
    } else {
      // Use real API in production
      axios
        .get(`http://localhost:3000/api/v1/products/${id}`)
        .then((resp) => {
          respStatus2.current = resp.data.status;
          setProduct({
            ...product,
            result: resp.data.data.data,
            status: resp.data.status,
            loading: false,
          });

          if (resp.data.status === "fail") {
            toast.error(resp.data.message);
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });
          setProduct({
            ...product,
            status: respStatus2,
            loading: false,
          });
        });}}
  , []);

  const showRev = (e) => {
    e.preventDefault();
    setReviews({
      ...reviews,

      loading: true,
    });
    axios
      .get(`http://localhost:3000/api/v1/products/${id}/review`)
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setReviews({
          ...reviews,
          results: resp.data.data.data,
          status: resp.data.status,
          loading: false,
          reload: reviews.reload + 1,
        });
        console.log(resp.data.data.data);

        if (resp.data.status === "fail") {
          toast.error(resp.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setReviews({
          ...reviews,
          status: respStatus2,
          loading: false,
          reload: reviews.reload + 1,
        });
      });
  };

  const HandleSubmit = (e) => {
    e.preventDefault();

    setReview({ ...review, loading: true });
    axios
      .post(
        `http://localhost:3000/api/v1/products/${id}/review`,
        {
          review: review.review,
          rating: review.rating,
          user: user._id,
          product: id,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus1 = resp.data.status;
        setReview({
          ...review,
          status: resp.data.status,
          loading: false,
          reload: review.reload + 1,
        });
        showRev(e);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setReview({
          ...review,
          status: respStatus1,
          loading: false,
          reload: review.reload + 1,
        });
      });
  };

  const addcart = (e) => {
    e.preventDefault();
    setAddCart({
      ...addCart,
      quantity: 1,
    });
    toast.loading("Adding To Cart...", {
      duration: 500,
    });

    axios
      .post(
        `http://localhost:3000/api/v1/addToCart/myCart/${id}`,
        {
          quantity: addCart.quantity,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus1.current = resp.data.status;
        toast.success("Successfully Added To Cart");
        setTimeout(() => {
          toast.success("Check Your Cart");
        }, 500);
        setAddCart({
          ...addCart,
          quantity: 1,
          status: resp.data.status,
          loading: false,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });

        setAddCart({
          ...addCart,
          quantity: 0,
          status: respStatus1.current,
          loading: false,
        });
        console.log(err);
      });
  };
  const deleteReview = (e, revId) => {
    e.preventDefault();
    if (user.role === "admin") {
      axios
        .delete(`http://localhost:3000/api/v1/reviews/${revId}`, {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        })
        .then((resp) => {
          respStatus1 = resp.data.status;
          setReviews({
            ...reviews,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userReviewed.current = false;
          setRating(0);
          setHoverRating(0);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    } else {
      axios
        .delete(`http://localhost:3000/api/v1/reviews/myReview/${revId}`, {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        })
        .then((resp) => {
          respStatus1 = resp.data.status;
          setReviews({
            ...reviews,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userReviewed.current = false;
          setRating(0);
          setHoverRating(0);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    }
  };

  const updateReview = (e, revId) => {
    e.preventDefault();
    if (user.role === "admin") {
      axios
        .patch(
          `http://localhost:3000/api/v1/reviews/${revId}`,
          {
            rating: review.rating,
            review: review.review,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus1 = resp.data.status;
          setReviews({
            ...reviews,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userReviewed.current = false;
          setRating(0);
          setHoverRating(0);
          setEditRev(false);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    } else {
      axios
        .patch(
          `http://localhost:3000/api/v1/reviews/myReview/${revId}`,
          {
            rating: review.rating,
            review: review.review,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus1 = resp.data.status;
          setReviews({
            ...reviews,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userReviewed.current = false;
          setRating(0);
          setHoverRating(0);
          setEditRev(false);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    }
  };

  const showCom = (e) => {
    e.preventDefault();
    setComments({
      ...comments,
      loading: true,
    });
    axios
      .get(`http://localhost:3000/api/v1/products/${id}/vote`)
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setComments({
          ...comments,
          results: resp.data.data.data,
          status: resp.data.status,
          loading: false,
          reload: comments.reload + 1,
        });
        console.log(resp.data.data.data);

        if (resp.data.status === "fail") {
          toast.error(resp.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setComments({
          ...comments,
          status: respStatus2,
          loading: false,
          reload: comments.reload + 1,
        });
      });
  };

  const updateComment = (e, revId) => {
    e.preventDefault();
    if (user.role === "admin") {
      axios
        .patch(
          `http://localhost:3000/api/v1/votes/${revId}`,
          {
            comment: comment.comment,
            report: comment.report,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus1 = resp.data.status;
          setComments({
            ...comments,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userCommented.current = true;
          setEditCom(false);
          showCom(e);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    } else {
      axios
        .patch(
          `http://localhost:3000/api/v1/votes/myVote/${revId}`,
          {
            comment: comment.comment,
            report: comment.report,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus1 = resp.data.status;
          setComments({
            ...comments,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });
          userCommented.current = true;
          setEditCom(false);
          showCom(e);
        })
        .catch((err) => {
          if (respStatus1 !== "success") {
            toast.error(err.response.data.message, {
              className: "w-auto",
            });
          }

          setReviews({
            ...reviews,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    }
  };

  const HandleComment = (e) => {
    e.preventDefault();

    setComment({ ...comment, loading: true });
    axios
      .post(
        `http://localhost:3000/api/v1/products/${id}/vote`,
        {
          comment: comment.comment,
          report: comment.report,
          user: user._id,
          product: id,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus1 = resp.data.status;
        setComment({
          ...comment,
          status: resp.data.status,
          loading: false,
          reload: review.reload + 1,
        });
        userCommented.current = true;
        showCom(e);
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setComment({
          ...comment,
          status: respStatus1,
          loading: false,
          reload: review.reload + 1,
        });
      });
  };

  const deleteComment = (e, revId) => {
    e.preventDefault();
    if (user.role === "admin") {
      axios
        .delete(`http://localhost:3000/api/v1/votes/${revId}`, {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        })
        .then((resp) => {
          respStatus1 = resp.data.status;
          setComments({
            ...comments,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });

          userCommented.current = false;
          showCom(e);
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });

          setComments({
            ...comments,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    } else {
      axios
        .delete(`http://localhost:3000/api/v1/votes/myVote/${revId}`, {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        })
        .then((resp) => {
          respStatus1 = resp.data.status;
          setComments({
            ...comments,
            status: resp.data.status,
            loading: false,
            reload: reviews.reload + 1,
          });

          userCommented.current = false;
          showCom(e);
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });

          setComments({
            ...comments,
            status: respStatus1.current,
            loading: false,
            reload: reviews.reload + 1,
          });
        });
    }
  };

  const indexOfLastReview = currentRevPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.results.slice(
    indexOfFirstReview,
    indexOfLastReview
  );

  const indexOfLastComment = currentComPage * reviewsPerPage;
  const indexOfFirstComment = indexOfLastComment - reviewsPerPage;
  const currentComments = comments.results.slice(
    indexOfFirstComment,
    indexOfLastComment
  );

  // Change page
  const paginateRev = (pageNumber) => setCurrentRevPage(pageNumber);
  const paginateCom = (pageNumber) => setCurrentComPage(pageNumber);

  return (
    <section className="max-container padding-container">
      <section className="py-12 sm:py-16">
        <div className="container px-4 mx-auto">
          {product.loading === true && (
            <ClipLoader
              className="color-cold-blue my-2"
              loading={true}
              size={70}
            />
          )}
          {}
          <div className="grid grid-cols-1 gap-12 mt-8 lg:col-gap-12 xl:col-gap-16 lg:mt-12 lg:grid-cols-5 lg:gap-16">
            {product.loading === false && (
              <>
                <div className="lg:col-span-3 lg:row-end-1">
                  <div className="lg:flex lg:items-start">
                    <div className="lg:order-2 lg:ml-5">
                      <div className="max-w-xl overflow-hidden rounded-lg">
                        <img
                          className="object-cover w-full h-full max-w-full"
                          alt=""
                          src={isDevelopment()? product.result.imageCover : `http://localhost:3000/img/${product.result.category}/${product.result.imageCover}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-2 lg:row-span-2 lg:row-end-2">
                  <h1 className="text-2xl font-bold text-cold-blue sm: sm:text-3xl">
                    {product.result.name}
                  </h1>

                  <div className="flex items-center mt-5">
                    <div className="flex items-center">
                      {[...Array(totalStars)].map((star, i) => {
                        const ratingValue = i + 1;
                        const isHalfStar =
                          product.result.ratingsAverage > i &&
                          product.result.ratingsAverage < i + 1;

                        return (
                          <div key={i}>
                            {isHalfStar && (
                              <svg
                                className="w-3 h-6 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 10 20"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{ position: "absolute" }}
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            )}
                            <svg
                              className={`w-6 h-6 ${
                                ratingValue <= product.result.ratingsAverage
                                  ? "text-yellow-500"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          </div>
                        );
                      })}
                    </div>
                    <span className="ml-2 text-sm font-bold text-yellow-500">
                      {" "}
                      {product.result.ratingsAverage}
                    </span>
                    <span className="ml-2 text-sm font-bold text-cold-blue">
                      {" "}
                      Rating
                    </span>
                  </div>

                  <h2 className="mt-8 text-xl font-bold text-cold-blue">
                    Specifications
                  </h2>
                  <hr />
                  <div className="flex flex-wrap items-center gap-1 mt-3 select-none">
                    {product.result.specifications}
                  </div>

                  <h2 className="mt-8 text-xl font-bold text-cold-blue">
                    Product Details
                  </h2>
                  {product.result.harmfultoenv === true && (
                    <div className="text-center py-3 items-center gap-1 mt-3 text-base font-bold text-yellow-300 hover:text-white transition-all hover:bg-yellow-500 duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-6 h-6 mx-3 inline"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        ></path>
                      </svg>
                      <span>THIS PRODUCT IS HARMFUL TO ENVIROMENT!</span>
                    </div>
                  )}
                  <div
                    className={`text-center py-3 w-auto items-center gap-1 mt-3 text-base font-bold  text-white-300 transition-all duration-200 ease-in-out border-2 border-transparent  rounded-md ${
                      product.result.stockQuantity === 0
                        ? "bg-red-500 bg-none focus:shadow hover:bg-red-600"
                        : "bg-cold-blue bg-none focus:shadow"
                    }`}
                  >
                    {product.result.stockQuantity === 0 && (
                      <div className="text-white">OUT OF STOCK!</div>
                    )}
                    {product.result.stockQuantity > 0 && (
                      <div className="text-white">
                        STOCK : {product.result.stockQuantity}
                      </div>
                    )}
                  </div>

                  <hr />
                  <div className="flex flex-wrap items-center gap-1 mt-3 select-none"></div>

                  <div className="flex flex-col items-center justify-between py-4 mt-10 space-y-4 border-t border-b sm:flex-row sm:space-y-0">
                    <div className="flex items-end">
                      <h1 className="text-3xl font-bold">
                        &pound;{product.result.price}
                      </h1>
                      <h1
                        style={{ "text-decoration": "line-through" }}
                        className="mb-2 text-bold text-[18px] font-light leading-[1.67rem] text-cold-blue xl:w-[70%] pl-2"
                      >
                        {product.result.originalPrice}
                      </h1>
                    </div>

                    {auth &&
                      (user.role === "user" || user.role === "expert") && (
                        <button
                          type="button"
                          onClick={addcart}
                          className="inline-flex items-center justify-center px-12 py-3 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 mr-3 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          Add to cart
                        </button>
                      )}
                    {!auth && (
                      <div className="inline-flex items-center justify-center px-12 py-3 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
                        Log in to add to cart
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            <div className="lg:col-span-3">
              <div className="border-b border-gray-300">
                <nav className="flex gap-4">
                  <button
                    className="inline-flex items-center py-4 text-sm font-medium text-gray-600 duration-300 border-b-2 border-transparent hover:text-gray-800 focus:text-gray-800"
                    onClick={(e) => {
                      setActiveTab("reviews");
                      showRev(e);
                    }}
                  >
                    Reviews
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                  <button
                    className="inline-flex items-center py-4 text-sm font-medium text-gray-600 duration-300 border-b-2 border-transparent hover:text-gray-800 focus:text-gray-800"
                    onClick={(e) => {
                      setActiveTab("comments");
                      showCom(e);
                    }}
                  >
                    Comments
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                </nav>
              </div>

              {activeTab == "reviews" &&
                (reviews.loading === true || review.loading === true) && (
                  <ClipLoader
                    className="color-cold-blue my-2"
                    loading={true}
                    size={70}
                  />
                )}

              {activeTab == "reviews" && reviews.loading === false && (
                <div>
                  <ul className="">
                    {reviews.results.length > 0 ? (
                      currentReviews.map((rev) => {
                        const userIsReviewer = rev.user._id === user._id;
                        if (userIsReviewer) {
                          userReviewed.current = true;
                        }
                        return (
                          <li
                            className="px-4 py-8 m-2 text-left border"
                            key={rev._id}
                          >
                            <div className="flex items-start">
                              <img
                                className="flex-shrink-0 block w-10 h-10 max-w-full align-middle rounded-full"
                                src={`http://localhost:3000/img/users/${rev.user.photo}`}
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
                                      {rev.user.name}
                                    </p>
                                    {(userIsReviewer ||
                                      user.role === "admin") && (
                                      <>
                                        <button
                                          onClick={() => setEditRev(true)}
                                          className="text-md font-bold cursor-pointer hover:text-green-600 text-green-500 ml-4"
                                        >
                                          Update
                                        </button>
                                        <button
                                          onClick={(e) =>
                                            deleteReview(e, rev._id)
                                          }
                                          className="text-lg font-bold cursor-pointer hover:text-red-600 text-red-500 ml-4"
                                        >
                                          Delete
                                        </button>
                                      </>
                                    )}
                                  </div>
                                  {editRev === true ? (
                                    <div className=" w-full my-2 mx-2 items-center">
                                      <button
                                        onClick={() => setEditRev(false)}
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
                                                (hoverRating || rating)
                                                  ? "text-yellow-500"
                                                  : ""
                                              }`}
                                              xmlns="http://www.w3.org/2000/svg"
                                              viewBox="0 0 20 20"
                                              fill="currentColor"
                                              onMouseEnter={() =>
                                                setHoverRating(ratingValue)
                                              }
                                              onMouseLeave={() =>
                                                setHoverRating(0)
                                              }
                                              onClick={() => {
                                                setRating(ratingValue);
                                                setReview({
                                                  ...review,
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
                                        {rev.createdAt.split("T", 1)[0]}
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

                  {auth && user.role === "user" && !userReviewed.current && (
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

              {activeTab == "comments" &&
                (comments.loading === true || comment.loading === true) && (
                  <ClipLoader
                    className="color-cold-blue my-2"
                    loading={true}
                    size={70}
                  />
                )}

              {activeTab == "comments" && comments.loading === false && (
                <div>
                  <ul className="">
                    {comments.results.length > 0 ? (
                      currentComments.map((rev) => {
                        const userIsCommenter = rev.user._id === user._id;
                        if (userIsCommenter) {
                          userReviewed.current = true;
                        }
                        return (
                          <li
                            className="px-4 py-8 m-2 text-left border"
                            key={rev._id}
                          >
                            <div className="flex items-start">
                              <img
                                className="flex-shrink-0 block w-10 h-10 max-w-full align-middle rounded-full"
                                src={`http://localhost:3000/img/users/${rev.user.photo}`}
                                alt=""
                              />
                              <div className="ml-6">
                                <div className="flex flex-col">
                                  <div className="flex items-center mt-5">
                                    <p className="text-xl font-bold text-green-500">
                                      {rev.user.name}
                                    </p>
                                    {rev.report === true && (
                                      <div className="relative inline-flex mx-3 items-center justify-center w-auto h-10 max-w-full px-4 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-red-600 rounded-md outline-none opacity-100 cursor-pointer focus:ring">
                                        Reported
                                      </div>
                                    )}

                                    {(userIsCommenter ||
                                      user.role === "admin") && (
                                      <>
                                        <button
                                          onClick={() => setEditCom(true)}
                                          className="text-md font-bold cursor-pointer hover:text-green-600 text-green-500 ml-4"
                                        >
                                          Update
                                        </button>
                                        <button
                                          onClick={(e) =>
                                            deleteComment(e, rev._id)
                                          }
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
                                        {rev.createdAt.split("T", 1)[0]}
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

                  {auth && user.role === "expert" && !userCommented.current && (
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
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Product;
