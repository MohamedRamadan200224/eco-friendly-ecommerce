import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";
import Header from "../components/Header";
import "react-toastify/dist/ReactToastify.css";
import { getAuthToken, getAuthUser } from "../helper/Storage";

const UpdateProduct = () => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  const user = getAuthUser();
  const respStatus2 = useRef("fail");
  const { id } = useParams();
  const [product, setProduct] = useState({
    name: "",
    specifications: "",
    category: "",
    stockQuantity: "",
    price: "",
    harmfultoenv: false,
    imageCover: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/products/${id}`)
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setProduct(resp.data.data.data);
        setLoading(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setLoading(false);
      });
  }, [id]);

  const editProduct = (e) => {
    e.preventDefault();

    toast.loading("Updating Product...", {
      duration: 500,
    });

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("specifications", product.specifications);
    formData.append("category", product.category);
    formData.append("stockQuantity", product.stockQuantity);
    formData.append("price", product.price);
    formData.append("harmfultoenv", product.harmfultoenv);
    formData.append("imageCover", product.imageCover);

    const endpoint = `http://localhost:3000/api/v1/products/myProducts/${id}`;

    axios
      .patch(endpoint, formData, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Successfully Updated Product!");
          navigate("/profile");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setProduct((prevState) => ({
      ...prevState,
      imageCover: e.target.files[0],
    }));
  };

  return (
    <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
      <div>
        <img src="/img_loginsignup.jpg" alt="hero_img" />
      </div>
      <div className="lg:w-[80%]">
        <div className="space-y-3">
          <h1 className="text-[28px] font-bold text-cold-blue">
            Update Product
          </h1>
          <p className="text-lg text-cold-blue">
            Lets make world better, Together!
          </p>
        </div>
        <form
          method="POST"
          className="flex flex-col gap-10 mt-10"
          onSubmit={editProduct}
        >
          <label>Product Name</label>
          <input
            type="text"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            required
            name="name"
            value={product.name}
            onChange={handleInputChange}
          />
          <label>Specifications</label>
          <textarea
            className="h-[281px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
            name="specifications"
            value={product.specifications}
            onChange={handleInputChange}
          />
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
            name="category"
            value={product.category}
            onChange={handleInputChange}
          >
            <option value="" disabled>
              Choose a category
            </option>
            <option value="Food">Food</option>
            <option value="Electronics">Electronics</option>
            <option value="Cars">Cars</option>
            <option value="Clothes">Clothes</option>
          </select>
          {product.category && (
            <div className="text-lg">
              <strong>Warning!</strong>
              {product.category === "Cars" &&
                " Please Make Sure To Enter the Car Type Whether it is Fuel or Electricity."}
              {product.category === "Food" &&
                " Please Make Sure To Enter the Ingredients Like milk...etc And If The Food Product Is Organic/Recycled...Mention it!."}
              {product.category === "Clothes" &&
                " Please Make Sure To Enter the Raw Material Like Leather, Cotton, Fabrics, Polyester..etc And Whether it is Industrial/faux Or Organic/Natural Or Recycled."}
            </div>
          )}
          <label>Price</label>
          <input
            type="number"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            required
            name="price"
            value={product.price}
            onChange={handleInputChange}
          />
          <label>Stock Quantity</label>
          <input
            type="number"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            required
            name="stockQuantity"
            value={product.stockQuantity}
            onChange={handleInputChange}
          />
          <label>Image Cover</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cold-blue file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-black focus:outline-none disabled:pointer-events-none disabled:opacity-60"
          />

          {auth && user.role === "admin" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="h-[50px] w-full cursor-pointer rounded-md bg-red-600 px-[20px] py-[12px] font-bold text-white"
                onClick={() =>
                  setProduct((prevState) => ({
                    ...prevState,
                    harmfultoenv: true,
                  }))
                }
              >
                Harmful ?
              </button>
            </div>
          )}

          <div className="flex flex-col gap-5">
            <button
              type="submit"
              className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
            >
              Update Product
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default UpdateProduct;
