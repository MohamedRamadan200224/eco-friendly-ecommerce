import axios from "axios";
import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import "react-toastify/dist/ReactToastify.css";
import { getAuthToken, setAuthToken, setAuthUser } from "../helper/Storage";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
const DiscountProduct = () => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  const { id } = useParams();
  const [productInfo, setProductInfo] = useState({
    result: "",
    onsaleDuration: 0,
    price: 0,
    status: "fail",
    loading: false,
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/products/${id}`)
      .then((resp) => {
        if (resp.data.status === "success") {
          // Show success message

          setProductInfo({
            ...productInfo,
            result: resp.data.data.data,
            status: resp.data.status,
            loading: false,
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setProductInfo({
          ...productInfo,
          status: "fail",
          loading: false,
        });
      });
  }, []);

  const discountProduct = (e) => {
    e.preventDefault();
    // try {

    axios
      .patch(
        `http://localhost:3000/api/v1/products/discount/${id}`,
        {
          onSale: true,
          price: productInfo.price,
          onsaleDuration: productInfo.onsaleDuration,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Product Is Successfully onSale!");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
      });
  };

  return (
    <>
      <Header title="Discount Product" subtitle="OnSale" />

      <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
        <div>
          <img src="/img_loginsignup.jpg" alt="hero_img" />
        </div>
        <div className="lg:w-[80%]">
          <form method="POST" className="flex flex-col gap-10 mt-10">
            <label>Discount Price</label>
            <input
              type="number"
              className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
              placeholder={productInfo.result.price}
              onChange={(e) =>
                setProductInfo({
                  ...productInfo,
                  price: e.target.value,
                })
              }
            />
            <label>Discount Duration</label>
            <input
              type="number"
              className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
              name="duration"
              required
              onChange={(e) =>
                setProductInfo({
                  ...productInfo,
                  onsaleDuration: e.target.value,
                })
              }
            />

            <div className="flex flex-col gap-5">
              <input
                type="submit"
                className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
                value="Submit Discount"
                onClick={discountProduct}
              />
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default DiscountProduct;
