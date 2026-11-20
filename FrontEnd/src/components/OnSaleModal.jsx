// Migrated to the shared api client (clean-code pass, 2026-11-19):
// no raw axios, no hardcoded localhost URL, no Authorization header
// (cookie auth — the httpOnly cookie is sent automatically), and
// request errors are toasted once by the client's interceptor.
import api from "../api/client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthUser } from "../helper/Storage";

const OnSaleModal = ({ onClose, productInfo }) => {

  const initialProductInfo = {
    ...productInfo,
  };

  const [localProductInfo, setLocalProductInfo] = useState(initialProductInfo);

  const [condition, setCondition] = useState({
    status: "fail",
    loading: true,
  });
  useEffect(() => {
    // Read the logged-in user here (mount-time value): getAuthUser() returns
    // a new object on every call, so it cannot be a dependency without
    // re-running this effect on every render.
    const currentUser = getAuthUser();
    if (currentUser && currentUser.role === "company") {
      setLocalProductInfo((l) => ({ ...l, owner: currentUser.id }));
    }
  }, []);

  const discountProduct = (e) => {
    e.preventDefault();
    // try {

    api
      .patch(
        `/api/v1/products/discount/${productInfo}`,
        {
          onSale: true,
          price: localProductInfo.price,
          onsaleDuration: localProductInfo.onsaleDuration,
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
      .catch(() => {
        // Error already toasted once by the api client interceptor.
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
