import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";

const Pagination = ({ reviewsPerPage, totalReviews, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalReviews / reviewsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className=" w-full pagination flex whitespace-wrap  place-content-center h-12 w-12 rounded-full m-5 p-10  cursor-pointer  transition-all">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item mx-4">
            <Link
              onClick={() => paginate(number)}
              className="page-link text-green-500 text-xl leading-tight focus:outline-none focus:shadow-outline py-3 px-3 rounded-full hover:bg-green-700  hover:text-white transition-all"
            >
              {number}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Product = () => {
  const user = getAuthUser();
  let respStatus1 = useRef("fail");
  const userReviewed = useRef(false);
  const [rating, setRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
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
    loading: true,
    status: "fail",
    reload: 0,
  });

  const [addCart, setAddCart] = useState({
    quantity: 0,
    loading: true,
    status: "fail",
    reload: 0,
  });

  const totalStars = 5;

  const [product, setProduct] = useState({
    result: "",
    loading: true,
    status: "fail",
  });
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/v1/products/${id}`)

      .then((resp) => {
        respStatus2.current = resp.data.status;
        setProduct({
          ...product,
          result: resp.data.data.data,
          status: resp.data.status,
          loading: false,
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
        setProduct({
          ...product,
          status: respStatus2,
          loading: false,
        });
      });
  }, []);

  // const totalStars = 5; // Total number of stars
  // const filledStars = Math.floor(rating); // Round the rating down to the nearest integer
  // const hasHalfStar = rating % 1 !== 0; // Check if rating has a half star

  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
    // if (tabName === "reviews") {
    // }
  };
  const HandleSubmit = (e) => {
    e.preventDefault();

    setReview({ ...review, loading: true });
    axios
      .post(
        `http://localhost:8080/api/v1/products/${id}/review`,
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
        });
      });
  };

  const showRev = () => {
    setReviews({
      ...reviews,

      loading: true,
    });
    axios
      .get(`http://localhost:8080/api/v1/products/${id}/review`)
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
        setReview({
          ...reviews,
          status: respStatus2,
          loading: false,
          reload: reviews.reload + 1,
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
        `http://localhost:8080/api/v1/addToCart/myCart/${id}`,
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

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.results.slice(
    indexOfFirstReview,
    indexOfLastReview
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <section className="max-container padding-container">
      <section className="py-12 sm:py-16">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-1 gap-12 mt-8 lg:col-gap-12 xl:col-gap-16 lg:mt-12 lg:grid-cols-5 lg:gap-16">
            <div className="lg:col-span-3 lg:row-end-1">
              <div className="lg:flex lg:items-start">
                <div className="lg:order-2 lg:ml-5">
                  <div className="max-w-xl overflow-hidden rounded-lg">
                    <img
                      className="object-cover w-full h-full max-w-full"
                      alt=""
                      src={
                        product.result.imageCover ||
                        "https://readymadeui.com/images/coffee2.webp"
                      }
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
                </div>

                {auth && user.role === "user" && (
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

            <div className="lg:col-span-3">
              <div className="border-b border-gray-300">
                <nav className="flex gap-4">
                  <button
                    className="inline-flex items-center py-4 text-sm font-medium text-gray-600 duration-300 border-b-2 border-transparent hover:text-gray-800 focus:text-gray-800"
                    onClick={() => {
                      handleButtonClick("reviews");
                      showRev();
                    }}
                  >
                    Reviews
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                  <button
                    className="inline-flex items-center py-4 text-sm font-medium text-gray-600 duration-300 border-b-2 border-transparent hover:text-gray-800 focus:text-gray-800"
                    onClick={() => handleButtonClick("comments")}
                  >
                    Comments
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                </nav>
              </div>

              {activeTab == "reviews" && (
                <div>
                  <ul className="">
                    {reviews.results.length > 0 ? (
                      currentReviews.results.map((rev) => {
                        return (
                          <li
                            className="px-4 py-8 m-2 text-left border"
                            key={rev._id}
                          >
                            {rev.user._id === user._id &&
                              (userReviewed.current = true)}
                            <div className="flex items-start">
                              <img
                                className="flex-shrink-0 block w-10 h-10 max-w-full align-middle rounded-full"
                                src={
                                  rev.photo || "https://dummyimage.com/30x30"
                                }
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
                                  <p className="mt-5 text-md font-bold text-green-500">
                                    {rev.user.name}
                                  </p>
                                  <p className="mt-5 text-base text-gray-900">
                                    {rev.review}
                                  </p>

                                  <p className="mt-1 font-bold text-sm text-gray-600">
                                    {rev.createdAt.split("T", 1)[0]}
                                  </p>
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
                          <svg
                            className="block w-6 h-6 text-gray-400 align-middle hover:text-yellow-500"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                              className=""
                            ></path>
                          </svg>
                          {[...Array(totalStars)].map((star, i) => {
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
                    paginate={paginate}
                  />
                </div>
              )}

              {activeTab == "comments" && (
                <div className="flow-root mt-8 sm:mt-12">
                  UNDER CONSTRUCTION
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
