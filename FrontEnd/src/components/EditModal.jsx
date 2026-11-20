// Migrated to the shared api client (clean-code pass, 2026-11-19):
// no raw axios, no hardcoded localhost URL, no Authorization header
// (cookie auth — the httpOnly cookie is sent automatically), and
// request errors are toasted once by the client's interceptor.
import api from "../api/client";
import { useState } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthUser } from "../helper/Storage";

const EditModal = ({ onClose, productInfo }) => {
  const user = getAuthUser();

  // const [product, setProduct] = useState({
  //   name: "",
  //   specifications: "",
  //   category: "",
  //   stockQuantity: 0,
  //   price: 0,
  //   owner: "",
  //   harmfultoenv: false,
  //   imageCover: null,
  //   loading: true,
  //   status: "",
  //   error: "",
  // });

  const initialProductInfo = {
    ...productInfo,
  };

  const [localProductInfo, setLocalProductInfo] = useState(initialProductInfo);

  const [condition, setCondition] = useState({
    status: "fail",
    loading: true,
  });

  const editProduct = (e) => {
    e.preventDefault();
    // try {
    const formData = new FormData();
    formData.append("name", localProductInfo.name);
    formData.append("specifications", localProductInfo.specifications);
    formData.append("category", localProductInfo.category);
    formData.append("stockQuantity", localProductInfo.stockQuantity);
    formData.append("price", localProductInfo.price);
    formData.append("harmfultoenv", localProductInfo.harmfultoenv);

    if (user && user.role === "company") {
      formData.append("owner", user.id);
    } else if (user && user.role === "admin") {
      formData.append("owner", localProductInfo.owner);
    }
    api
      .patch(
        `/api/v1/products/myProducts/${localProductInfo.id}`,
        formData
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Product Is Successfully Updated!");

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
              <label>Product Name</label>
              <input
                type="text"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
                value={localProductInfo.name}
                placeholder={localProductInfo.name}
                onChange={(e) =>
                  setLocalProductInfo({
                    ...localProductInfo,
                    name: e.target.value,
                  })
                }
              />
              <label>Product Price</label>
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
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
            placeholder={localProductInfo.category}
            value={localProductInfo.category}
            onChange={(e) =>
              setLocalProductInfo({
                ...localProductInfo,
                category: e.target.value,
              })
            }
          >
            <option selected>Choose a category</option>
            <option value="Food">Food</option>
            <option value="Electronics">Electronics</option>
            <option value="Cars">Cars</option>
            <option value="Clothes">Clothes</option>
          </select>
          {localProductInfo.category !== "" &&
            (() => {
              switch (localProductInfo.category) {
                case "Cars":
                  return (
                    <div className="text-lg">
                      <strong>Warning!</strong> Please Make Sure To Enter the
                      Car Type Whether it is Fuel or Electricity.
                    </div>
                  );
                case "Food":
                  return (
                    <div className="text-lg">
                      <strong>Warning!</strong> Please Make Sure To Enter the
                      Ingredients Like milk...etc And If The Food Product Is
                      Organic/Recycled...Mention it!.
                    </div>
                  );
                case "Clothes":
                  return (
                    <div className="text-lg">
                      <strong>Warning!</strong> Please Make Sure To Enter the
                      Raw Material Like Leather,Cotton,Fabrics,polyster..etc And
                      Whether it is Industrial/faux Or Organic/Natural Or
                      Recycled.
                    </div>
                  );
                default:
                  break;
              }
            })}
          <div className="flex flex-col gap-4 mt-4">
            <label>Specifications</label>
            <textarea
              type="text"
              className="h-[281px] rounded-md border border-cold-blue px-[20px] py-[12px]"
              placeholder={localProductInfo.specifications}
              required
              maxLength="5000"
              value={localProductInfo.specifications}
              onChange={(e) =>
                setLocalProductInfo({
                  ...localProductInfo,
                  specifications: e.target.value,
                })
              }
            />
          </div>

          <label>Stock Quantity</label>
          <input
            type="number"
            placeholder={localProductInfo.stockQuantity}
            className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            value={localProductInfo.stockQuantity}
            onChange={(e) =>
              setLocalProductInfo({
                ...localProductInfo,
                stockQuantity: e.target.value,
              })
            }
          />

          {/* No image upload in the demo: uploads land on the serverless
              function's ephemeral disk and never persist, so the product
              keeps its current cover (or a placeholder). Info and details
              only. */}
          <div className="rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Image upload isn&apos;t available in the demo — the product
            keeps its current image (or a placeholder). You can update the
            product info and details below.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="submit"
              className="h-[50px] w-full cursor-pointer rounded-md bg-red-600 px-[20px] py-[12px] font-bold text-white"
              onClick={() =>
                setLocalProductInfo({ ...localProductInfo, harmfultoenv: true })
              }
              value="Harmful ?"
            />
            {user && user.role === "admin" && (
              <input
                type="text"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
                placeholder={localProductInfo.owner}
                value={localProductInfo.owner}
                onChange={(e) =>
                  setLocalProductInfo({
                    ...localProductInfo,
                    owner: e.target.value,
                  })
                }
              />
            )}
          </div>

          <input
            type="submit"
            className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white"
            value="Update Product"
            onClick={editProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default EditModal;
