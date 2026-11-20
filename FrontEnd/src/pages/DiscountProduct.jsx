// Migrated to the shared api client (clean-code pass, 2026-11-19):
// no raw axios, no hardcoded localhost URL, no Authorization header
// (cookie auth — the httpOnly cookie is sent automatically), and
// request errors are toasted once by the client's interceptor.
import api from "../api/client";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
const DiscountProduct = () => {
  const { id } = useParams();
  const [productInfo, setProductInfo] = useState({
    result: "",
    onsaleDuration: 0,
    price: 0,
    status: "fail",
    loading: false,
  });

  useEffect(() => {
    api
      .get(`/api/v1/products/${id}`)
      .then((resp) => {
        if (resp.data.status === "success") {
          // Show success message

          setProductInfo((p) => ({
            ...p,
            result: resp.data.data.data,
            status: resp.data.status,
            loading: false,
          }));
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setProductInfo((p) => ({
          ...p,
          status: "fail",
          loading: false,
        }));
      });
  }, [id]);

  const discountProduct = (e) => {
    e.preventDefault();
    // Validate client-side: the backend requires price to be a *number*
    // (typeof check), so sending the input's raw string 400s every time,
    // and leaving the field untouched sent 0, which 400s too.
    const currentPrice = productInfo.result
      ? productInfo.result.price
      : undefined;
    if (!productInfo.price || productInfo.price <= 0) {
      toast.error("Enter a discount price greater than 0.");
      return;
    }
    if (currentPrice !== undefined && productInfo.price >= currentPrice) {
      toast.error("The discount price must be lower than the current price.");
      return;
    }
    if (!productInfo.onsaleDuration || productInfo.onsaleDuration <= 0) {
      toast.error("Enter a discount duration in days.");
      return;
    }

    api
      .patch(
        `/api/v1/products/discount/${id}`,
        {
          onSale: true,
          price: productInfo.price,
          onsaleDuration: productInfo.onsaleDuration,
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Product Is Successfully onSale!");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
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
                  // Number(): the backend rejects a string price
                  // (typeof !== 'number' → 400), and e.target.value is
                  // always a string.
                  price: Number(e.target.value),
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
                  onsaleDuration: Number(e.target.value),
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
