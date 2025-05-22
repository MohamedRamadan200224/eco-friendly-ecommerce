import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const EditModal = ({ onClose }) => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  const user = getAuthUser();

  const [product, setProduct] = useState({
    name: "",
    specifications: "",
    category: "",
    stockQuantity: 0,
    price: 0,
    owner: "",
    harmfultoenv: false,
    imageCover: null,
    loading: true,
    status: "",
    error: "",
  });

  const createProduct = (e) => {
    e.preventDefault();
    // try {

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("specifications", product.specifications);
    formData.append("category", product.category);
    formData.append("stockQuantity", product.stockQuantity);
    formData.append("price", product.price);
    formData.append("harmfultoenv", product.harmfultoenv);
    formData.append("imageCover", product.imageCover);

    if (auth && user.role === "company") {
      formData.append("owner", user.id);
    } else if (auth && user.role === "admin") {
      formData.append("owner", product.owner);
    }
    console.log(formData);
    axios
      .post(
        `http://localhost:3000/api/v1/products/myProducts`,

        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Product Is Successfully Created!");

          // Show success message
          setProduct({
            ...product,
            status: resp.data.status,
            loading: false,
            error: "",
          });

          navigate("/");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setProduct({
          ...product,
          loading: false,
          error: err.response.data.message,
        });
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
                value={product.name}
                onChange={(e) =>
                  setProduct({ ...product, name: e.target.value })
                }
              />
              <label>Product Price</label>
              <input
                type="number"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
                value={product.price}
                onChange={(e) =>
                  setProduct({ ...product, price: e.target.value })
                }
              />
            </div>
          </div>
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
          >
            <option selected>Choose a category</option>
            <option value="Food">Food</option>
            <option value="Electronics">Electronics</option>
            <option value="Cars">Cars</option>
            <option value="Clothes">Clothes</option>
          </select>
          {product.category !== "" &&
            (() => {
              switch (product.category) {
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
            })()}
          <div className="flex flex-col gap-4 mt-4">
            <label>Specifications</label>
            <textarea
              type="text"
              className="h-[281px] rounded-md border border-cold-blue px-[20px] py-[12px]"
              placeholder="Write here"
              required
              maxLength="5000"
              value={product.specifications}
              onChange={(e) =>
                setProduct({ ...product, specifications: e.target.value })
              }
            />
          </div>

          <label>Stock Quantity</label>
          <input
            type="number"
            className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
            value={product.stockQuantity}
            onChange={(e) =>
              setProduct({ ...product, stockQuantity: e.target.value })
            }
          />

          <label>Image Cover</label>
          <input
            id="example1"
            type="file"
            onChange={(e) =>
              setProduct({ ...product, imageCover: e.target.files[0] })
            }
            className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cold-blue file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-black focus:outline-none disabled:pointer-events-none disabled:opacity-60"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="submit"
              className="h-[50px] w-full cursor-pointer rounded-md bg-red-600 px-[20px] py-[12px] font-bold text-white"
              onClick={() => setProduct({ ...product, harmfultoenv: true })}
              value="Harmful ?"
            />
            {auth && user.role === "admin" && (
              <input
                type="text"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
                placeholder="Owner's ID"
                value={product.owner}
                onChange={(e) =>
                  setProduct({ ...product, owner: e.target.value })
                }
              />
            )}
          </div>

          <input
            type="submit"
            className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white"
            value="Submit"
            onClick={createProduct}
          />
        </div>
      </div>
    </div>
  );
};

export default EditModal;
