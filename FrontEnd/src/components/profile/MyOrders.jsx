// "My Orders" tab of the profile page, extracted from Profile.jsx.
//
// Fetches the logged-in user's orders through the shared useApiList hook
// (fetch + paginate; this tab has no search box, same as before). Props:
//   user — the logged-in user from getAuthUser() (only used for the
//          role gate in Profile.jsx; the endpoint itself is per-user)
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). Image URLs are built with the client's imageUrl helper,
// not a hardcoded localhost string.
import React from "react";
import { ClipLoader } from "react-spinners";
import api, { imageUrl } from "../../api/client";
import { useApiList } from "../../hooks/useApiList";
import Pagination from "../Pagination";

const MyOrders = () => {
  const orders = useApiList({
    load: () =>
      api.get(`/api/v1/myOrders`).then((resp) => resp.data.orders),
  });

  return (
    <>
      {orders.loading === true && (
        <ClipLoader
          className="color-cold-blue my-2"
          loading={true}
          size={70}
        />
      )}

      {orders.loading === false && orders.results.length === 0 && (
        <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
          There are no Orders yet
        </div>
      )}

      {orders.loading === false && orders.results.length > 0 && (
        <>
          {orders.currentItems.map((order) => {
            return order.products.map((product) => {
              return (
                <div
                  key={product.product._id}
                  className="flex flex-col justify-between gap-3 mx-2 my-2 px-2 py-2 border rounded-md xs:flex-row border-cold-blue"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={imageUrl(
                        product.product.category,
                        product.product.imageCover
                      )}
                      className="rounded hover:border hover:border-green-400"
                      alt=""
                      width={30}
                      height={30}
                    />
                    <p className="mx-2 my-2 flex items-center text-bold text-green-500 gap-2">
                      {product.product.name}
                    </p>
                  </div>
                  <p className="mx-2 my-2 flex items-center text-bold text-green-500 gap-2">
                    {product.product.category}
                  </p>
                  <p className="mx-2 my-2 flex items-center text-bold text-mint-blue gap-2">
                    {order.createdAt.split("T", 1)[0]}
                  </p>
                  <p className="mx-2 my-2 flex items-center text-bold text-black-500 gap-2">
                    $ {product.product.price}
                  </p>
                </div>
              );
            });
          })}
          <Pagination
            reviewsPerPage={10}
            totalReviews={orders.results.length}
            paginate={orders.paginate}
          />
        </>
      )}
    </>
  );
};

export default MyOrders;
