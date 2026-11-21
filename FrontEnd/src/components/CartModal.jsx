import axios from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
// Auth is cookie-based: the backend sets an httpOnly `jwt` cookie and
// axios calls use withCredentials. No token is read from storage here.
import PropTypes from "prop-types";
import EcoLoader from "./EcoLoader";
import { imageUrl, handleImgError } from "../api/client";

// API base URL from the environment (defaults to the local backend).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const CartModal = ({ onClose }) => {
  const respStatus1 = useRef("fail");
  const [totalPrice, setTotalPrice] = useState(0);
  // In-flight guard for checkout: double-clicking used to create two
  // Stripe sessions. The ref stays set after a successful redirect
  // (we navigate away); it is cleared again only on failure.
  const checkingOutRef = useRef(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const [cart, setCart] = useState({
    results: [],
    quantities: {},
    loading: true,
    status: "fail",
    reload: 0,
  });

  // Fetch the cart. `silent` skips the loading spinner (background refetch
  // after a delete); the initial load is visible. State is always updated
  // with functional setState — the old code spread the stale `cart`
  // closure, so a refetch after deleting the last item never cleared the
  // just-deleted rows (ghost cart).
  const fetchCart = useCallback((silent = false) => {
    if (!silent) {
      setCart((prev) => ({ ...prev, loading: true }));
    }

    axios
      .get(`${API_URL}/api/v1/addToCart/myCart`, {
        withCredentials: true,
      })
      .then((resp) => {
        respStatus1.current = resp.data.status;
        // Items whose product was deleted from the catalogue come back
        // with product: null — drop them instead of crashing the render.
        const products = (resp.data.data || []).filter(
          (item) => item.product
        );
        const initialQuantities = products.reduce((acc, item) => {
          acc[item.product.id] = item.quantity || 1;
          return acc;
        }, {});

        setCart((prev) => ({
          ...prev,
          results: products,
          quantities: initialQuantities,
          status: resp.data.status,
          loading: false,
        }));

        setTotalPrice(resp.data.totalPrice || 0);
      })
      .catch(() => {
        // Belt-and-braces: never keep stale items on screen after a
        // failed load. The backend now answers 200 for an empty cart, so
        // this only fires on genuine failures. A failed *background*
        // refetch keeps the optimistic state instead (see below).
        if (!silent) {
          setCart((prev) => ({
            ...prev,
            results: [],
            quantities: {},
            status: respStatus1.current,
            loading: false,
          }));
          setTotalPrice(0);
        } else {
          setCart((prev) => ({ ...prev, loading: false }));
        }
      });
  }, []);

  // Initial load is visible; refetches (reload bumped after a delete) are
  // silent so the list never flashes a spinner.
  useEffect(() => {
    fetchCart(cart.reload > 0);
  }, [fetchCart, cart.reload]);

  const removeItem = (e, id) => {
    e.preventDefault();
    // Optimistic: take the item out immediately (and its share of the
    // total) so the list never flashes a spinner. The reload bump on
    // success triggers a silent background refetch to confirm the server
    // state; on failure the pre-click state is restored and the same
    // refetch confirms it.
    const prevResults = cart.results;
    const prevQuantities = cart.quantities;
    const prevTotal = totalPrice;
    const removed = prevResults.find((item) => item.product?.id === id);
    const removedAmount =
      (removed?.product.price || 0) * (prevQuantities[id] || 1);
    setCart((prev) => {
      const quantities = { ...prev.quantities };
      delete quantities[id];
      return {
        ...prev,
        results: prev.results.filter((item) => item.product?.id !== id),
        quantities,
      };
    });
    setTotalPrice((prevTotalPrice) =>
      Math.max(0, prevTotalPrice - removedAmount)
    );
    axios
      .delete(`${API_URL}/api/v1/addToCart/myCart/${id}`, {
        withCredentials: true,
      })
      .then((resp) => {
        respStatus1.current = resp.data.status;
        // Bump only on success, via functional update, so rapid deletes
        // can never lose a bump to a stale closure.
        setCart((prev) => ({ ...prev, reload: prev.reload + 1 }));
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Could not remove the item.",
          {
            className: "w-auto",
          }
        );
        setCart((prev) => ({
          ...prev,
          results: prevResults,
          quantities: prevQuantities,
          reload: prev.reload + 1,
        }));
        setTotalPrice(prevTotal);
      });
  };

  const deleteAll = (e) => {
    e.preventDefault();
    // Optimistic: empty the list immediately; same confirm/rollback
    // pattern as removeItem.
    const prevResults = cart.results;
    const prevQuantities = cart.quantities;
    const prevTotal = totalPrice;
    setCart((prev) => ({ ...prev, results: [], quantities: {} }));
    setTotalPrice(0);
    axios
      .delete(`${API_URL}/api/v1/addToCart/myCart`, {
        withCredentials: true,
      })
      .then((resp) => {
        respStatus1.current = resp.data.status;
        setCart((prev) => ({ ...prev, reload: prev.reload + 1 }));
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.message || "Could not clear the cart.",
          {
            className: "w-auto",
          }
        );
        setCart((prev) => ({
          ...prev,
          results: prevResults,
          quantities: prevQuantities,
          reload: prev.reload + 1,
        }));
        setTotalPrice(prevTotal);
      });
  };

  const handleQuantityChange = (id, delta) => {
    const current = cart.quantities[id] || 1;
    const newQuantity = current + delta;
    if (newQuantity < 1) return; // Prevent negative quantities
    const item = cart.results.find((entry) => entry.product?.id === id);
    const price = item?.product.price || 0;

    // Optimistic: show the new quantity and total immediately, then
    // confirm with the server. The PATCH runs outside any state updater
    // — the old code fired it inside setCart, where StrictMode in dev
    // double-invokes the updater and the PATCH could fire twice, and
    // rapid clicks computed from the still-old quantity.
    setCart((prev) => ({
      ...prev,
      quantities: { ...prev.quantities, [id]: newQuantity },
    }));
    setTotalPrice((prevTotalPrice) =>
      Math.max(0, prevTotalPrice + price * delta)
    );

    axios
      .patch(
        `${API_URL}/api/v1/addToCart/myCart/${id}`,
        { quantity: newQuantity },
        { withCredentials: true }
      )
      .catch((err) => {
        // Revert to the previous quantity on failure.
        setCart((prev) => ({
          ...prev,
          quantities: { ...prev.quantities, [id]: current },
        }));
        setTotalPrice((prevTotalPrice) =>
          Math.max(0, prevTotalPrice - price * delta)
        );
        if (delta === 1) {
          toast.error(
            err.response?.data?.message || "Could not update quantity."
          );
        }
      });
  };

  const handleCheckout = async () => {
    if (checkingOutRef.current) return;
    checkingOutRef.current = true;
    setCheckingOut(true);
    try {
      const resp = await axios.get(
        `${API_URL}/api/v1/addToCart/Checkout-session`,
        {
          withCredentials: true,
        }
      );
      // Navigate straight to the session URL. The old code used the
      // deprecated stripe.redirectToCheckout({ sessionId }), which only
      // works when the publishable key belongs to the same Stripe account
      // and mode (test/live) as the secret key that created the session —
      // a mismatch shows Stripe's "Something went wrong" page, and the
      // { error } redirectToCheckout resolves with was ignored, so the
      // failure was silent. The session URL needs no publishable key.
      window.location.href = resp.data.session.url;
    } catch {
      checkingOutRef.current = false;
      setCheckingOut(false);
      toast.error("Failed to initiate checkout. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-md">
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
                  <EcoLoader label="Loading your cart…" />
                )}
                {cart.loading === false && cart.results.length > 0 && (
                  <div className="bg-white rounded-md shadow">
                    <div className="px-4 py-6 sm:px-8 sm:py-10">
                      <div className="flow-root">
                        <ul className="-my-8">
                          {cart.loading === false &&
                            cart.results.length > 0 &&
                            cart.results
                              .filter((item) => item.product)
                              .map((item) => {
                              return (
                                <li
                                  key={item.product.id}
                                  className="flex flex-col py-6 space-y-3 text-left sm:flex-row sm:space-x-5 sm:space-y-0"
                                >
                                  <div className="shrink-0">
                                    <img
                                      className="object-cover w-24 h-24 max-w-full rounded-lg"
                                      src={imageUrl(
                                        item.product.category,
                                        item.product.imageCover
                                      )}
                                      onError={handleImgError(
                                        item.product.name
                                      )}
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
                          disabled={checkingOut}
                          className="inline-flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white transition-all duration-200 ease-in-out bg-gray-900 rounded-md group focus:shadow hover:bg-gray-800 disabled:opacity-60"
                        >
                          {checkingOut ? "Redirecting…" : "Checkout"}
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
