import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { PRODUCTS } from "../../constants";
import Testimonials from "../components/Testimonials";
import { GoPlus } from "react-icons/go";
import Modal from "../components/Modal";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import { Link, useNavigate } from "react-router-dom";

const Pagination = ({ productsPerPage, totalProducts, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalProducts / productsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className=" w-full pagination flex whitespace-wrap  place-content-center h-12 w-12 rounded-full m-5 p-10  cursor-pointer  transition-all">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item mx-4">
            <Link
              onClick={() => paginate(number)}
              className="page-link text-green-500 text-xl leading-tight focus:outline-none focus:shadow-outline py-3 px-3 rounded-full hover:bg-green-700  hover:text-white transition-all"
            >
              {number}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

const Products = () => {
  let category = "";
  let categoryNum = useRef(0);
  const [activeTab, setActiveTab] = useState("");
  const [countCategoryProducts, setCountCategoryProducts] = useState({
    num: 0,
    categorySet: false,
  });
  let reloadcategory = useRef(0);
  const [products, setProducts] = useState({
    results: [],
    loading: true,
    status: "",
    reload: 0,
  });
  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
    reloadcategory.current = products.reload + 1;
  };
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const auth = getAuthToken();
  const user = getAuthUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12);

  useEffect(() => {
    const getProducts = async () => {
      let resp;
      if (activeTab !== "") {
        // TODO document why this block is empty

        resp = await axios.get(
          `http://localhost:8080/api/v1/products?category=${activeTab}`
        );
      } else {
        resp = await axios.get(`http://localhost:8080/api/v1/products`);
      }
      console.log(resp.data.data.data);
      setProducts({
        ...products,
        results: resp.data.data.data,
        status: resp.data.status,
        loading: false,
      });
    };

    getProducts();
  }, [activeTab]);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.results.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <Header title="Products" subtitle="Browse our" />

      <section className="max-container padding-container">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-4 lg:mx-auto lg:w-[70%] text-[18px] px-4 py-1 font-medium rounded-md bg-cold-blue text-mint">
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Cars");
              setCurrentPage(1);
            }}
          >
            Cars
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Food");
              setCurrentPage(1);
            }}
          >
            Food
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Clothes");
              setCurrentPage(1);
            }}
          >
            Cloth
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Electronics");
              setCurrentPage(1);
            }}
          >
            Electronics
          </button>
        </div>
        {auth && (user.role === "admin" || user.role === "company") && (
          <div className="relative">
            <button
              className="absolute right-0 px-1 py-1 rounded-md bg-cold-blue top-1"
              onClick={() => setShowModal(true)}
            >
              <GoPlus color="#8DECB4" size={25} />
            </button>
            {showModal == true && <Modal onClose={() => setShowModal(false)} />}
          </div>
        )}

        {/* {countCategoryProducts.num === 0 && activeTab !== "" && (
          <div className="flex items-center justify-center">
            <div className="p-6 m-10 max-w-sm mx-auto bg-cold-blue  rounded-xl shadow-md flex items-center space-x-4">
              <div className="text-xl text-center font-medium text-mint">
                No Products Added Yet!
              </div>
            </div>
          </div>
        )} */}
        <div className="grid gap-4 mt-10 cursor-pointer sm:grid-cols-2 md:grid-cols-4">
          {currentProducts.length > 0 &&
            currentProducts.map((duct) => (
              <div
                key={duct._id}
                className="flex flex-col border-2 rounded-md border-cold-blue  hover:border-green-500 transform duration-500 hover:-translate-y-2"
              >
                <a href={`/products/${duct.id}`}>
                  <img
                    src={duct.imageCover || PRODUCTS[0].img}
                    alt="featured products"
                  />
                  <h2 className="mt-[25px] text-[24px] font-bold text-cold-blue pl-2">
                    {duct.name}
                  </h2>
                  <p className="pl-2 mb-4 text-sm leading-3 text-green-600">
                    {duct.category}
                  </p>
                  <p className="mb-2 text-[18px] font-light leading-[1.67rem] text-cold-blue xl:w-[70%] pl-2">
                    {duct.price}
                  </p>
                </a>
              </div>
            ))}
        </div>
        {currentProducts.length === 0 && (
          <div className="flex items-center justify-center">
            <div className="p-6 m-10 max-w-sm mx-auto bg-cold-blue  rounded-xl shadow-md flex items-center space-x-4">
              <div className="text-xl text-center font-medium text-mint">
                No Products Added Yet!
              </div>
            </div>
          </div>
        )}
        <div>
          <Pagination
            productsPerPage={productsPerPage}
            totalProducts={products.results.length}
            paginate={paginate}
          />
        </div>
      </section>

      <Testimonials />
    </>
  );
};

export default Products;
