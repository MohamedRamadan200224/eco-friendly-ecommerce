import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import PropTypes from "prop-types";
import { useParams } from "react-router-dom";
import Skeleton from "react-loading-skeleton";

let totalPrice = 0;

function CartItem({ item, onQuantityChange, initialQuantity }) {
  CartItem.propTypes = {
    item: PropTypes.shape({
      product: PropTypes.shape({
        price: PropTypes.number.isRequired,
        // Include other properties of the product object here...
      }).isRequired,
      // Include other properties of the item object here...
    }).isRequired,
    onQuantityChange: PropTypes.func.isRequired,
    initialQuantity: PropTypes.number.isRequired,
  };

  const [quantity, setQuantity] = useState(initialQuantity);

  useEffect(() => {
    onQuantityChange(item.product.price * quantity, quantity);
  }, []);

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(item.product.price, newQuantity);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(-item.product.price, newQuantity);
    }
  };

  totalPrice = item.product.price * quantity;

  return (
    <>
      <div className="sm:order-1">
        <div className="flex items-stretch h-8 mx-auto text-gray-600">
          <button
            onClick={decreaseQuantity}
            className="flex items-center justify-center px-4 transition bg-gray-200 rounded-l-md hover:bg-black hover:text-white"
          >
            -
          </button>
          <div className="flex items-center justify-center w-full px-4 text-xs uppercase transition bg-gray-100">
            {quantity}
          </div>
          <button
            onClick={increaseQuantity}
            className="flex items-center justify-center px-4 transition bg-gray-200 rounded-r-md hover:bg-black hover:text-white"
          >
            +
          </button>
        </div>
      </div>
      <p className="w-20 text-base font-semibold text-gray-900 shrink-0 sm:order-2 sm:ml-8 sm:text-right">
        ${totalPrice.toFixed(2)}
      </p>
    </>
  );
}

const CartModal = ({ onClose }) => {
  const user = getAuthUser();
  let respStatus1 = useRef("fail");
  const auth = getAuthToken();
  const [totalPrice, setTotalPrice] = useState(0);

  const [quantities, setQuantities] = useState({}); // New state for quantities

  const handleQuantityChange = (price, id, quantity) => {
    setTotalPrice((prevTotalPrice) => prevTotalPrice + price);
    setQuantities((prevQuantities) => ({ ...prevQuantities, [id]: quantity }));
  };

  const [cart, setCart] = useState({
    results: [],
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
      .get(
        `http://localhost:8080/api/v1/addToCart/myCart`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus1.current = resp.data.status;
        console.log(resp);
        const initialTotalPrice = resp.data.data[0].products.reduce(
          (sum, item) => sum + item.product.price,
          0
        );
        setTotalPrice(initialTotalPrice);
        setCart({
          ...cart,
          results: resp.data.data[0].products,
          status: resp.data.status,
          loading: false,
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
        });
      });
  }, [cart.reload]);

  const removeItem = (e, id, itemTotalPrice) => {
    e.preventDefault();

    setTotalPrice((prevTotalPrice) => prevTotalPrice - itemTotalPrice);

    setCart({ ...cart, loading: true, reload: 0 });
    axios
      .delete(`http://localhost:8080/api/v1/addToCart/myCart/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        respStatus1 = resp.data.status;
        setCart({
          ...cart,
          status: resp.data.status,
          loading: false,
          reload: cart.reload + 1,
        });
      })
      .catch((err) => {
        console.log(err);
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

              <div className="max-w-2xl mx-auto mt-8 md:mt-12">
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
                                    src={
                                      item.product.imageCover ||
                                      "https://dummyimage.com/300x300"
                                    }
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
                                      <CartItem
                                        key={item.product.id}
                                        item={item}
                                        onQuantityChange={(price, quantity) =>
                                          handleQuantityChange(
                                            price,
                                            item.product.id,
                                            quantity
                                          )
                                        }
                                        initialQuantity={
                                          quantities[item.product.id] || 1
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="absolute top-0 right-0 flex sm:bottom-0 sm:top-auto">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        removeItem(
                                          e,
                                          item.product._id,
                                          item.product.price *
                                            (quantities[item.product.id] || 1)
                                        );
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

                    <div className="py-2 mt-6 border-t border-b">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Subtotal</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {/* ... */}${totalPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">Shipping</p>
                        <p className="text-lg font-semibold text-gray-900">
                          $100.00
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-6">
                      <p className="text-sm font-medium text-gray-900">Total</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        <span className="text-xs font-normal text-gray-400">
                          USD
                        </span>{" "}
                        {(totalPrice + 100).toFixed(2)}
                      </p>
                    </div>

                    <div className="mt-6 text-center">
                      <button
                        type="button"
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
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
