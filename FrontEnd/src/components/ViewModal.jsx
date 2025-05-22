import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";

const ViewModal = ({ onClose, productInfo }) => {
  const user = getAuthUser();
  let respStatus2 = useRef("fail");

  const [product, setProduct] = useState({
    result: {},
    loading: true,
    status: "fail",
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/products/${productInfo.id}`)
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setProduct({
          ...product,
          result: resp.data.data.data,
          status: resp.data.status,
          loading: false,
        });
        console.log(productInfo.id);

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

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col gap-5 mt-10 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col items-center gap-5 px-20 py-10 mx-4 bg-white rounded-xl">
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
                            src="https://dummyimage.com/300x300"
                            alt=""
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
                        <svg
                          className="block w-4 h-4 text-yellow-500 align-middle"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            className=""
                          ></path>
                        </svg>
                        <svg
                          className="block w-4 h-4 text-yellow-500 align-middle"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            className=""
                          ></path>
                        </svg>
                        <svg
                          className="block w-4 h-4 text-yellow-500 align-middle"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            className=""
                          ></path>
                        </svg>
                        <svg
                          className="block w-4 h-4 text-yellow-500 align-middle"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            className=""
                          ></path>
                        </svg>
                        <svg
                          className="block w-4 h-4 text-yellow-500 align-middle"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                            className=""
                          ></path>
                        </svg>
                      </div>
                      <p className="ml-2 text-sm font-medium text-gray-500">
                        Rating
                      </p>
                    </div>

                    <h2 className="mt-8 text-xl font-bold text-cold-blue">
                      Specifications
                    </h2>
                    <hr />
                    <div className="flex flex-wrap items-center gap-1 mt-3 select-none">
                      {product.result.specifications}
                    </div>

                    <h2 className="mt-8 text-xl font-bold text-cold-blue">
                      HARMFUL PRODUCT : {product.result.harmfultoenv}
                    </h2>
                    <hr />

                    <div className="flex flex-col items-center justify-between gap-10 py-4 mt-10 space-y-4 border-t border-b sm:flex-row sm:space-y-0">
                      <div className="flex items-end">
                        <h1 className="text-3xl font-bold">
                          &pound;{product.result.price}
                        </h1>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
