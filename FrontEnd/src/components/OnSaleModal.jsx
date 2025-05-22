import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { getAuthToken, getAuthUser } from "../helper/Storage";

const OnSaleModal = ({ onClose, productInfo }) => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  const user = getAuthUser();

  const initialProductInfo = {
    ...productInfo,
  };

  const [localProductInfo, setLocalProductInfo] = useState(initialProductInfo);

  const [condition, setCondition] = useState({
    status: "fail",
    loading: true,
  });
  useEffect(() => {
    if (auth && user.role === "company") {
      setLocalProductInfo({ ...localProductInfo, owner: user.id });
    }
  }, []);

  const discountProduct = (e) => {
    e.preventDefault();
    // try {

    axios
      .patch(
        `http://localhost:3000/api/v1/products/discount/${productInfo}`,
        {
          onSale: true,
          price: localProductInfo.price,
          onsaleDuration: localProductInfo.onsaleDuration,
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

          // Show success message
          setLocalProductInfo({ ...localProductInfo });
          setCondition({
            ...condition,
            status: resp.data.status,
            loading: false,
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setLocalProductInfo({ ...localProductInfo });
        setCondition({ ...condition, status: "error", loading: false });
      });
  };

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center p-10 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col w-full h-full gap-5 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col gap-5 px-2 py-5 mx-2 bg-white sm:px-10 sm:mx-4 rounded-xl">
          <div>
            <div className="grid gap-3">
              <label>Discount Price</label>
              <input
                type="number"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
                value={localProductInfo.price}
                placeholder={localProductInfo.price}
                onChange={(e) =>
                  setLocalProductInfo({
                    ...localProductInfo,
                    price: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <label>
              Discount Duration{" "}
              <span className="text-green-400">(in Days)</span>
            </label>
            <textarea
              type="number"
              className="h-[281px] rounded-md border border-cold-blue px-[20px] py-[12px]"
              placeholder={localProductInfo.onsaleDuration}
              required
              maxLength="5000"
              value={localProductInfo.onsaleDuration}
              onChange={(e) =>
                setLocalProductInfo({
                  ...localProductInfo,
                  onsaleDuration: e.target.value,
                })
              }
            />
          </div>

          <input
            type="submit"
            className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white"
            value="Discount Product"
            onClick={discountProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default OnSaleModal;
