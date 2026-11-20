// Products listing page.
//
// Fetches from the real API only (owner decision, 2026-11-19): the old
// isDevelopment() / mock-data branch is gone. Fetch / search / paginate
// come from the shared useApiList hook; the local Pagination component
// this file used to define is deleted — the shared
// src/components/Pagination.jsx is used instead (note its prop names:
// reviewsPerPage / totalReviews, not productsPerPage / totalProducts).
// Images are built with the client's imageUrl helper, not a hardcoded
// localhost string. The debug console.log(duct) in the render loop is
// removed.
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). The logged-in check is the stored user, not
// getAuthToken(): the token helper returns undefined since auth moved to
// an httpOnly cookie (security PR #1).
import { useState } from "react";
import Header from "../components/Header";
import { GoPlus } from "react-icons/go";
import Modal from "../components/Modal";
import { getAuthUser } from "../helper/Storage";
import { FaMedal } from "react-icons/fa";
import { ClipLoader } from "react-spinners";
import api, { imageUrl, handleImgError } from "../api/client";
import { useApiList } from "../hooks/useApiList";
import Pagination from "../components/Pagination";

const Products = () => {
  const [activeTab, setActiveTab] = useState("");
  const [options, setOptions] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const user = getAuthUser();

  const products = useApiList({
    load: () => {
      const params = new URLSearchParams();
      if (activeTab !== "") params.set("category", activeTab);
      if (options === true) params.set("onSale", "true");
      const query = params.toString();
      return api
        .get(`/api/v1/products${query ? `?${query}` : ""}`)
        .then((resp) => resp.data.data.data);
    },
    searchFields: ["price", "name", "ratingsAverage", "stockQuantity"],
    perPage: 10,
    deps: [activeTab, options],
  });

  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
  };

  // Change page
  const paginate = (pageNumber) => {
    products.paginate(pageNumber);
  };

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
            value={products.q}
            /*
                                // set the value of our useState q
                                //  anytime the user types in the search box
                                */
            onChange={(e) => products.setQ(e.target.value)}
          />
        </label>
      </div>
      <section className="max-container padding-container">
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5 lg:mx-auto lg:w-[70%] text-[18px] px-4 py-1 font-medium rounded-md bg-cold-blue text-mint">
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("");
              products.setCurrentPage(1);
            }}
          >
            All
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Cars");
              products.setCurrentPage(1);
            }}
          >
            Cars
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Food");
              products.setCurrentPage(1);
            }}
          >
            Food
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Clothes");
              products.setCurrentPage(1);
            }}
          >
            Cloth
          </button>
          <button
            className="browse"
            onClick={() => {
              handleButtonClick("Electronics");
              products.setCurrentPage(1);
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
        {user && (user.role === "admin" || user.role === "company") && (
          <div className="relative">
            <button
              className="absolute right-0 px-1 py-1 rounded-md bg-cold-blue top-1"
              onClick={() => setShowModal(true)}
            >
              <GoPlus color="#8DECB4" size={25} />
            </button>
            {showModal === true && <Modal onClose={() => setShowModal(false)} />}
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
            products.currentItems.length > 0 &&
            products.currentItems.map((duct) => (
              <div
                key={duct._id}
                className="relative flex flex-col border-2 rounded-md border-cold-blue  hover:border-green-500 transform duration-500 hover:-translate-y-2"
              >
                <a href={`/products/${duct.id}`}>
                  {duct.owner && duct.owner.isCertified === true && (
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
                    src={imageUrl(duct.category, duct.imageCover)}
                    alt="featured products"
                    onError={handleImgError(duct.name)}
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
        {products.loading === false && products.currentItems.length === 0 && (
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
            reviewsPerPage={products.perPage}
            totalReviews={products.results.length}
            paginate={paginate}
          />
        </div>
      </section>

     
    </>
  );
};

export default Products;
