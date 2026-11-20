// Product detail page: product display + add-to-cart only.
//
// The review flow and the vote/comment flow used to live here too
// (~1,327 lines total). They are now separate components —
// ./reviews/ReviewSection.jsx and ./reviews/VoteSection.jsx — each owning
// its own state and API calls. This file keeps the product fetch, the
// product display, the add-to-cart action and the tab navigation.
//
// The frontend always calls the real API now (owner decision, 2026-11-19):
// the old isDevelopment() / mock-data branch is gone. All requests go
// through the shared api client (cookie auth, one shared error toast).
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import api, { imageUrl } from "../api/client";
import ReviewSection from "./reviews/ReviewSection";
import VoteSection from "./reviews/VoteSection";

const Product = () => {
  const user = getAuthUser();
  const statusRef = useRef("fail");
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("description");
  // Bumped on every tab click so the sections load exactly when opened
  // (the old code called showRev / showCom from the tab buttons).
  const [revSignal, setRevSignal] = useState(0);
  const [comSignal, setComSignal] = useState(0);

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
    api
      .get(`/api/v1/products/${id}`)
      .then((resp) => {
        statusRef.current = resp.data.status;
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
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setProduct({
          ...product,
          status: statusRef.current,
          loading: false,
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addcart = (e) => {
    e.preventDefault();
    setAddCart({
      ...addCart,
      quantity: 1,
    });
    toast.loading("Adding To Cart...", {
      duration: 500,
    });

    api
      .post(`/api/v1/addToCart/myCart/${id}`, {
        quantity: addCart.quantity,
      })
      .then((resp) => {
        statusRef.current = resp.data.status;
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
      .catch(() => {
        setAddCart({
          ...addCart,
          quantity: 0,
          status: statusRef.current,
          loading: false,
        });
      });
  };

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
                          src={imageUrl(
                            product.result.category,
                            product.result.imageCover
                          )}
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

                    {/* Logged-in check is the stored user, not getAuthToken():
                        the token helper returns undefined since auth moved
                        to an httpOnly cookie (security PR #1). */}
                    {user &&
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
                    {!user && (
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
                    onClick={() => {
                      setActiveTab("reviews");
                      setRevSignal((signal) => signal + 1);
                    }}
                  >
                    Reviews
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                  <button
                    className="inline-flex items-center py-4 text-sm font-medium text-gray-600 duration-300 border-b-2 border-transparent hover:text-gray-800 focus:text-gray-800"
                    onClick={() => {
                      setActiveTab("comments");
                      setComSignal((signal) => signal + 1);
                    }}
                  >
                    Comments
                    <span className="block px-2 py-px ml-2 text-xs font-bold text-gray-100 bg-gray-500 rounded-full"></span>
                  </button>
                </nav>
              </div>

              {activeTab === "reviews" && (
                <ReviewSection
                  productId={id}
                  user={user}
                  loadSignal={revSignal}
                />
              )}

              {activeTab === "comments" && (
                <VoteSection
                  productId={id}
                  user={user}
                  loadSignal={comSignal}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Product;
