import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
// import { useStripe } from "@stripe/react-stripe-js";
/* eslint-disable */
import { loadStripe } from "@stripe/stripe-js";
import { ClipLoader } from "react-spinners";

const stripePromise = loadStripe(
  "pk_test_51PCOfv05mtZeaC1xDQIDUrtTfB8M6pQ17DaHV7A7thWTVDoRyLeUmoT3hdY6fnmDzmrmUCFvbpEoz3IGFcn1GyZb00yRBSXUzG"
);

const CartModal = ({ onClose }) => {
  const user = getAuthUser();
  let respStatus1 = useRef("fail");
  const auth = getAuthToken();
  const [totalPrice, setTotalPrice] = useState(0);
  // const stripe = useStripe();

  const [cart, setCart] = useState({
    results: [],
    quantities: {},
    loading: true,
    status: "fail",
    reload: 0,
  });

  useEffect(() => {
    setCart({
      ...cart,
      loading: true,
    });

    axios
      .get(`http://localhost:3000/api/v1/addToCart/myCart`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        let products = [];
        respStatus1.current = resp.data.status;
        products = resp.data.data;
        if (products) {
          const initialQuantities = products.reduce((acc, item) => {
            acc[item.product.id] = 1; // Assuming the initial quantity is 1 for each item
            return acc;
          }, {});

          setCart({
            ...cart,
            results: products,
            quantities: initialQuantities,
            status: resp.data.status,
            loading: false,
          });

          setTotalPrice(resp.data.totalPrice);
        }
        // Set initial quantities to 1
      })
      .catch((err) => {
        setCart({
          ...cart,
          status: respStatus1.current,
          loading: false,
        });
      });
  }, [cart.reload]);

  const removeItem = (e, id) => {
    e.preventDefault();
    setCart({ ...cart, loading: true, reload: 0 });
    axios
      .delete(`http://localhost:3000/api/v1/addToCart/myCart/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        respStatus1.current = resp.data.status;
        setCart({
          ...cart,
          status: resp.data.status,
          loading: false,
          reload: cart.reload + 1,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setCart({
          ...cart,
          status: respStatus1.current,
          loading: false,
          reload: cart.reload + 1,
        });
      });
  };

  const deleteAll = (e, id) => {
    e.preventDefault();
    setCart({ ...cart, loading: true, reload: 0 });
    axios
      .delete(`http://localhost:3000/api/v1/addToCart/myCart`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        respStatus1.current = resp.data.status;
        setCart({
          ...cart,
          status: resp.data.status,
          loading: false,
          reload: cart.reload + 1,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setCart({
          ...cart,
          status: respStatus1.current,
          loading: false,
          reload: cart.reload + 1,
        });
      });
  };

  const updateQuantity = (id, quantity) => {
    setCart((prevCart) => {
      const newQuantities = {
        ...prevCart.quantities,
        [id]: quantity,
      };
      const newTotalPrice = prevCart.results.reduce((acc, item) => {
        return acc + item.product.price * newQuantities[item.product.id];
      }, 0);
      setTotalPrice(newTotalPrice);

      return {
        ...prevCart,
        quantities: newQuantities,
      };
    });
  };

  const handleQuantityChange = (id, delta) => {
    setCart((prevCart) => {
      const newQuantity = prevCart.quantities[id] + delta;
      if (newQuantity < 1) return prevCart; // Prevent negative quantities

      axios
        .patch(
          `http://localhost:3000/api/v1/addToCart/myCart/${id}`,
          { quantity: newQuantity },
          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then(() => {
          updateQuantity(id, newQuantity);
        })
        .catch((err) => {
          if (delta === 1) {
            toast.error(err.response.data.message);
          }
        });
      return {
        ...prevCart,
        quantities: {
          ...prevCart.quantities,
        },
      };
    });
  };

  const handleCheckout = async () => {
    const stripe = await stripePromise;
    axios
      .get(`http://localhost:3000/api/v1/addToCart/Checkout-session`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then(async (resp) => {
        const sessionId = resp.data.session.id;
        // When the customer clicks on the button, redirect them to Checkout.
        await stripe.redirectToCheckout({
          sessionId,
        });
      })
      .catch((err) => {
        toast.error("Failed to initiate checkout. Please try again.");
      });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white rounded-md">
        <div className="flex flex-col w-full gap-5 p-5 text-cold-blue">
          <button onClick={onClose} className="self-end">
            <IoMdCloseCircleOutline size={30} color="#263238" />
          </button>
          <section className="py-8 bg-gray-100 rounded-md sm:py-12 lg:py-16">
            <div className="px-4 mx-auto sm:px-6 lg:px-8">
              <div className="flex items-center justify-center">
                <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  Your Cart
                </h1>
              </div>
              <button
                onClick={deleteAll}
                className="text-lg mx-5 font-semibold text-red-500 hover:text-red-600 "
              >
                Remove All
              </button>

              <div className="max-w-2xl mx-auto mt-8 md:mt-12">
                {cart.loading === true && (
                  <ClipLoader
                    className="color-cold-blue my-2"
                    loading={true}
                    size={70}
                  />
                )}
                {cart.loading === false && cart.results.length > 0 && (
                  <div className="bg-white rounded-md shadow">
                    <div className="px-4 py-6 sm:px-8 sm:py-10">
                      <div className="flow-root">
                        <ul className="-my-8">
                          {cart.loading === false &&
                            cart.results.length > 0 &&
                            cart.results.map((item) => {
                              return (
                                <li
                                  key={item.product.id}
                                  className="flex flex-col py-6 space-y-3 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                                >
                                  <div className="shrink-0">
                                    <img
                                      className="object-cover w-24 h-24 max-w-full rounded-lg"
                                      src={`http://localhost:3000/img/${item.product.category}/${item.product.imageCover}`}
                                      alt="Product"
                                    />
                                  </div>

                                  <div className="relative flex flex-col justify-between flex-1">
                                    <div className="sm:col-gap-5 sm:grid sm:grid-cols-2">
                                      <div className="pr-8 sm:pr-5">
                                        <p className="text-base font-semibold text-gray-900">
                                          {item.product.name}
                                        </p>
                                        <p className="mx-0 mt-1 mb-0 text-sm text-gray-400">
                                          {item.product.category}
                                        </p>
                                      </div>

                                      <div className="flex items-end justify-between mt-4 sm:mt-0 sm:items-start sm:justify-end">
                                        <div className="sm:order-1">
                                          <div className="flex items-stretch h-8 mx-auto text-gray-600">
                                            <button
                                              onClick={() =>
                                                handleQuantityChange(
                                                  item.product.id,
                                                  -1
                                                )
                                              }
                                              className="flex items-center justify-center px-4 transition bg-gray-200 rounded-l-md hover:bg-black hover:text-white"
                                            >
                                              -
                                            </button>
                                            <div className="flex items-center justify-center w-full px-4 text-xs uppercase transition bg-gray-100">
                                              {cart.quantities[item.product.id]}
                                            </div>
                                            <button
                                              onClick={() =>
                                                handleQuantityChange(
                                                  item.product.id,
                                                  1
                                                )
                                              }
                                              className="flex items-center justify-center px-4 transition bg-gray-200 rounded-r-md hover:bg-black hover:text-white"
                                            >
                                              +
                                            </button>
                                          </div>
                                        </div>
                                        <p className="w-20 text-base font-semibold text-gray-900 shrink-0 sm:order-2 sm:ml-8 sm:text-right">
                                          $
                                          {(
                                            item.product.price *
                                            cart.quantities[item.product.id]
                                          ).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto">
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          removeItem(e, item.product.id);
                                        }}
                                        className="flex p-2 text-center text-gray-500 transition-all duration-200 ease-in-out rounded focus:shadow hover:text-gray-900"
                                      >
                                        <svg
                                          className="w-5 h-5"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                          ></path>
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              );
                            })}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between mt-6">
                        <p className="text-sm font-medium text-gray-900">
                          Total
                        </p>
                        <p className="text-2xl font-semibold text-gray-900">
                          <span className="text-xs font-normal text-gray-400">
                            USD
                          </span>{" "}
                          {totalPrice.toFixed(2)}
                        </p>
                      </div>

                      <div className="mt-6 text-center">
                        <button
                          type="button"
                          onClick={handleCheckout}
                          className="inline-flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out bg-gray-900 rounded-md group focus:shadow hover:bg-gray-800"
                        >
                          Checkout
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-6 h-6 ml-4 transition-all group-hover:ml-8"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {cart.loading === false && cart.results.length === 0 && (
                <div className="flex items-center justify-center">
                  <div className="p-6 m-10 max-w-sm mx-auto bg-cold-blue  rounded-xl shadow-md flex items-center space-x-4">
                    <div className="text-xl text-center font-medium text-mint">
                      No Items Added Yet!
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

CartModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default CartModal;
