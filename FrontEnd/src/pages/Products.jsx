import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { GoPlus } from "react-icons/go";
import Modal from "../components/Modal";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import { Link, useNavigate } from "react-router-dom";
import { FaMedal } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
// Import our mock data and environment utility
import { getAllProducts, getProductsByCategory, getProductsOnSale } from "../mockData/products";
import { isDevelopment } from "../utils/environment";

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
  const [activeTab, setActiveTab] = useState("");
  let reloadcategory = useRef(0);
  const [products, setProducts] = useState({
    results: [],
    loading: true,
    status: "",
    reload: 0,
  });
  const [q, setQ] = useState("");

  const [searchParam] = useState([
    "price",
    "name",
    "ratingsAverage",
    "stockQuantity",
  ]);

  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
    reloadcategory.current = products.reload + 1;
  };
  const [showModal, setShowModal] = useState(false);
  const [options, setOptions] = useState(false);
  const auth = getAuthToken();
  const user = getAuthUser();

  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);

  useEffect(() => {
    const getProducts = async () => {
      let resp;
      setProducts({ ...products, loading: true });

      // Check if we're in development mode
      if (isDevelopment()) {
        // Use mock data based on filters
        if (activeTab !== "") {
          if (options === false) {
            resp = { data: getProductsByCategory(activeTab) };
          } else if (options === true) {
            // Filter by category and onSale
            const categoryProducts = getProductsByCategory(activeTab);
            const filteredProducts = categoryProducts.data.data.filter(p => p.onSale === true);
            resp = { 
              data: {
                status: "success",
                data: {
                  data: filteredProducts
                }
              }
            };
          }
        } else {
          if (options === false) {
            resp = { data: getAllProducts() };
          } else if (options === true) {
            resp = { data: getProductsOnSale() };
          }
        }
      } else {
        // Use real API in production
        if (activeTab !== "") {
          if (options === false) {
            resp = await axios.get(
              `http://localhost:3000/api/v1/products?category=${activeTab}`
            );
          } else if (options === true) {
            resp = await axios.get(
              `http://localhost:3000/api/v1/products?category=${activeTab}&onSale=true`
            );
          }
        } else {
          if (options === false) {
            resp = await axios.get(`http://localhost:3000/api/v1/products`);
          } else if (options === true) {
            resp = await axios.get(
              `http://localhost:3000/api/v1/products?onSale=true`
            );
          }
        }
      }

      setProducts({
        ...products,
        results: resp.data.data.data,
        status: resp.data.status,
        loading: false,
      });
    };

    getProducts();
  }, [activeTab, options]);

  // Get current products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.results.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  function search(items) {
    return items.filter((item) => {
      if (item.category == activeTab) {
        return searchParam.some((newItem) => {
          return (
            item[newItem].toString().toLowerCase().indexOf(q.toLowerCase()) > -1
          );
        });
      } else if (activeTab == "") {
        return searchParam.some((newItem) => {
          return (
            item[newItem].toString().toLowerCase().indexOf(q.toLowerCase()) > -1
          );
        });
      }
    });
  }

  return (
    <>
      <Header title="Products" subtitle="Browse our" />

      <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
        <label htmlFor="search-form">
          <input
            type="search"
            name="search-form"
            id="search-form"
            className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
            placeholder="Search for Products..."
            value={q}
            /*
                                // set the value of our useState q
                                //  anytime the user types in the search box
                                */
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
      </div>
      <section className="max-container padding-container">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5 lg:mx-auto lg:w-[70%] text-[18px] px-4 py-1 font-medium rounded-md bg-cold-blue text-mint">
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("");
              setCurrentPage(1);
            }}
          >
            All
          </button>
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
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-2 lg:mx-auto lg:w-[40%] text-[18px] px-4 py-1 mx-2 my-3 font-medium rounded-md bg-cold-blue text-mint">
          <button
            className="browse"
            onClick={() => {
              setOptions(false);
            }}
          >
            All
          </button>
          <button
            className="browse"
            onClick={() => {
              setOptions(true);
            }}
          >
            Offers
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
        {products.loading === true && (
          <ClipLoader
            className="color-cold-blue my-2"
            loading={true}
            size={70}
          />
        )}

        <div className="grid gap-4 mt-10 cursor-pointer sm:grid-cols-2 md:grid-cols-4">
          {products.loading === false &&
            currentProducts.length > 0 &&
            search(currentProducts).map((duct) => (
              <div
                key={duct._id}
                className="relative flex flex-col border-2 rounded-md border-cold-blue  hover:border-green-500 transform duration-500 hover:-translate-y-2"
              >
                {console.log(duct)}
                <a href={`/products/${duct.id}`}>
                  {duct.owner.isCertified === true && (
                    <span
                      className="absolute top-0 right-0 tracking-wider text-white bg-yellow-400 px-4 py-1 text-sm rounded leading-loose mx-2 my-2 font-semibold"
                      title=""
                    >
                      <FaMedal className="h-5 w-5 inline-block align-middle" />
                      <span className="align-middle"> Certified Seller</span>
                    </span>
                  )}
                  {duct.onSale === true && (
                    <span
                      className="absolute top-0 left-0 tracking-wider text-white bg-green-400 px-4 py-1 text-sm rounded leading-loose mx-2 my-2 font-semibold"
                      title=""
                    >
                      <span className="align-middle">{(duct.price*100/duct.originalPrice).toFixed(0)}% OFF</span>
                    </span>
                  )}

                  <img
                    src={isDevelopment() ? duct.imageCover : `http://localhost:3000/img/${duct.category}/${duct.imageCover}`}
                    alt="featured products"
                    className="h-48 w-full"
                  />
                  <h2 className="mt-[25px] text-[24px] font-bold text-cold-blue pl-2">
                    {duct.name}
                  </h2>
                  <p className="pl-2 mb-4 text-sm leading-3 text-green-600">
                    {duct.category}
                  </p>
                  <div className="pl-2 mb-2 xl:w-[70%]">
  {duct.onSale ? (
    <div className="flex items-center gap-2">
      <span className="text-[18px] text-gray-500 line-through">
        ${duct.originalPrice}
      </span>
      <span className="text-[20px] text-green-600 font-semibold">
        ${duct.price}
      </span>
    </div>
  ) : (
    <span className="text-[20px] text-cold-blue font-medium">
      ${duct.price}
    </span>
  )}
</div>

                </a>
              </div>
            ))}
        </div>
        {products.loading === false && currentProducts.length === 0 && (
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

     
    </>
  );
};

export default Products;
