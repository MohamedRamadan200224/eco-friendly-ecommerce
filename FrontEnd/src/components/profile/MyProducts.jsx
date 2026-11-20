// "My Products" tab of the profile page, extracted from Profile.jsx.
//
// Admins see every product, companies see only their own. Fetch / search /
// paginate come from the shared useApiList hook. Props:
//   user — the logged-in user from getAuthUser()
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). Image URLs are built with the client's imageUrl helper,
// not a hardcoded localhost string.
import { Link } from "react-router-dom";
import { TbViewportWide } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { ClipLoader } from "react-spinners";
import toast from "react-hot-toast";
import api, { imageUrl } from "../../api/client";
import { useApiList } from "../../hooks/useApiList";
import Pagination from "../Pagination";

const MyProducts = ({ user }) => {
  const products = useApiList({
    load: () => {
      const url =
        user.role === "admin"
          ? `/api/v1/products`
          : `/api/v1/products/myProducts/${user._id}`;
      return api.get(url).then((resp) => resp.data.data.data);
    },
    searchFields: ["harmfultoenv", "onSale", "name", "category"],
    deps: [user],
  });

  const removeItem = (e, id) => {
    e.preventDefault();
    api
      .delete(`/api/v1/products/myProducts/${id}`)
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Deleted Successfully");
        }
        products.reload();
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        products.reload();
      });
  };

  const removeDiscount = (e, onSaleId) => {
    e.preventDefault();
    api
      .patch(`/api/v1/products/noDiscount/${onSaleId}`, {})
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Removed Discount Successfully");
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
      });
  };

  return (
    <>
      {products.loading === true && (
        <ClipLoader
          className="color-cold-blue my-2"
          loading={true}
          size={70}
        />
      )}

      {products.loading === false && (
        <>
          <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
            <label htmlFor="search-form">
              <input
                type="search"
                name="search-form"
                id="search-form"
                className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
                placeholder="Search for Products..."
                value={products.q}
                onChange={(e) => products.setQ(e.target.value)}
              />
            </label>
          </div>
          {products.results.length > 0 &&
            products.currentItems.map((product) => {
              return (
                <div
                  key={product._id}
                  className="flex flex-col justify-between gap-3 mx-2 my-2 px-2 py-2 border rounded-md xs:flex-row border-cold-blue"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={imageUrl(product.category, product.imageCover)}
                      className="rounded hover:border hover:border-green-400"
                      alt=""
                      width={30}
                      height={30}
                    />
                    <p>{product.name}</p>
                  </div>
                  <p className="mx-2 my-2 flex items-center text-green-500 gap-2">
                    {product.category}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      className="px-2 py-2 rounded-md bg-cold-blue cursor-pointer"
                      to={`/products/${product.id}`}
                    >
                      <TbViewportWide color="white" />
                    </Link>
                    <Link
                      className="px-2 py-2 rounded-md bg-cold-blue"
                      to={`/discountproduct/${product.id}`}
                    >
                      <MdEdit color="white" />
                    </Link>

                    <Link
                      className="px-2 py-2 rounded-md bg-cold-blue"
                      to={`/updateproduct/${product.id}`}
                    >
                      <MdEdit color="white" />
                    </Link>

                    <button
                      className="px-2 py-2 bg-red-500 rounded-md hover:bg-red-600"
                      onClick={(e) => {
                        removeItem(e, product.id);
                      }}
                    >
                      <MdDelete color="white" />
                    </button>
                    <button
                      className="px-2 py-2 bg-cold-blue rounded-md w-full text-white"
                      onClick={(e) => removeDiscount(e, product.id)}
                    >
                      Remove Discount
                    </button>
                  </div>
                </div>
              );
            })}
          <Pagination
            reviewsPerPage={10}
            totalReviews={products.results.length}
            paginate={products.paginate}
          />
        </>
      )}

      {products.results.length === 0 && (
        <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
          You Did Not add Products yet!
        </div>
      )}
    </>
  );
};

export default MyProducts;
