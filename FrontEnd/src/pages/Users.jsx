import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";
import { Link } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { GoPlus } from "react-icons/go";

const Users = () => {
  const auth = getAuthToken();
  let id = useRef("");
  let respStatus2 = useRef("fail");

  const [users, setUsers] = useState({
    results: [],
    loading: false,
    status: "fail",
    reload: 0,
  });
  const [deleteuser, setdeleteUser] = useState({
    loading: false,
    status: "fail",
    reload: 0,
  });

  useEffect(() => {
    const getUsers = async () => {
      setUsers({ ...users, loading: true });
      axios
        .get(
          `http://localhost:3000/api/v1/users`,

          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus2.current = resp.data.status;
          setUsers({
            ...users,
            results: resp.data.data.data,
            status: resp.data.status,
            loading: false,
            reload: users.reload + 1,
          });
          console.log(resp.data.data.data);

          if (resp.data.status === "fail") {
            toast.error(resp.data.message);
          }
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });
          setUsers({
            ...users,
            status: respStatus2.current,
            loading: false,
            reload: users.reload + 1,
          });
        });
    };

    getUsers();
  }, [deleteuser.reload]);

  const deleteUser = (e) => {
    e.preventDefault();
    setdeleteUser({ ...deleteUser, loading: true });

    axios
      .delete(
        `http://localhost:3000/api/v1/users/${id.current}`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setdeleteUser({
          ...deleteuser,
          status: resp.data.status,
          loading: false,
          reload: deleteuser.reload + 1,
        });

        if (resp.data.status === "fail") {
          toast.error(resp.data.message);
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setdeleteUser({
          ...deleteuser,
          status: respStatus2,
          loading: false,
          reload: deleteuser.reload + 1,
        });
      });
  };

  const [q, setQ] = useState("");
  const [searchParam] = useState(["name", "email", "id", "role"]);

  const [currentUsersPage, setCurrentUsersPage] = useState(1);
  const [productsPerPage] = useState(10);

  const indexOfLastUser = currentUsersPage * productsPerPage;
  const indexOfFirstUser = indexOfLastUser - productsPerPage;
  const currentUsers = users.results.slice(indexOfFirstUser, indexOfLastUser);

  // Change page

  const paginateUsers = (pageNumber) => setCurrentUsersPage(pageNumber);

  function search(items) {
    return items.filter((item) => {
      return searchParam.some((newItem) => {
        return (
          item[newItem].toString().toLowerCase().indexOf(q.toLowerCase()) > -1
        );
      });
    });
  }

  return (
    <section className="max-container padding-container">
      <div className="max-w-screen-lg px-4 py-8 mx-auto sm:px-8">
        <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
          <label htmlFor="search-form">
            <input
              type="search"
              name="search-form"
              id="search-form"
              className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
              placeholder="Search for Users..."
              value={q}
              /*
                                // set the value of our useState q
                                //  anytime the user types in the search box
                                */
              onChange={(e) => setQ(e.target.value)}
            />
          </label>
        </div>
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="font-semibold text-cold-blue">User Accounts</h2>
            <span className="text-xs text-gray-500">
              View accounts of registered users
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="ml-10 space-x-8 lg:ml-40"></div>
          </div>
          <div className="relative">
            <Link
              className="absolute right-0 px-1 py-1 rounded-md bg-cold-blue top-1"
              to={"/createuser"}
            >
              <GoPlus color="#8DECB4" size={25} />
            </Link>
          </div>
        </div>

        <div className=" border rounded-lg">
          <div className="">
            <table className="w-full">
              <thead>
                <tr className="text-xs font-semibold tracking-widest text-left text-white uppercase bg-green-600">
                  <th className="px-5 py-3">ID</th>
                  <th className="px-5 py-3">Full Name</th>
                  <th className="px-5 py-3">User Role</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-500">
                {users.loading === true && (
                  <ClipLoader
                    className="color-cold-blue my-2 align-center"
                    loading={true}
                    size={70}
                  />
                )}
                {users.loading === false &&
                  users.results.length > 0 &&
                  search(currentUsers).map((user) => {
                    return (
                      <tr key={user.id}>
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <p className="whitespace-no-wrap font-bold text-green-500">
                            {user.id}
                          </p>
                        </td>
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <img
                                className="w-full h-full rounded-full"
                                src={
                                  `http://localhost:3000/img/users/${user.photo}` ||
                                  "https://dummyimage.com/30x30"
                                }
                                alt=""
                              />
                            </div>
                            <div className="ml-3">
                              <p className="whitespace-no-wrap font-semibold">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-5 text-sm bg-white font-semibold border-b border-gray-200">
                          <p className="whitespace-no-wrap">
                            {user.role.toUpperCase()}
                          </p>
                        </td>
                        <td className="px-5 py-5 text-sm bg-white text-green-500 font-semibold border-b border-gray-200">
                          <p className="whitespace-no-wrap">{user.email}</p>
                        </td>

                        {user.active !== true && (
                          <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                            <span className="px-3 py-1 text-xs font-semibold text-green-900 bg-green-200 rounded-full">
                              Active
                            </span>
                          </td>
                        )}
                        {user.active === true && (
                          <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                            <span className="px-3 py-1 text-xs font-semibold text-green-900 bg-red-200 rounded-full">
                              Inactive
                            </span>
                          </td>
                        )}
                        <td className="px-5 py-5 text-sm bg-white border-b border-gray-200 w-min">
                          <div className="flex justify-end space-x-4">
                            <Link
                              to={`/updateuser/${user.id}`}
                              className="w-auto h-10 max-w-full px-4 py-3 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 hover:bg-green-700 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                            >
                              Update
                            </Link>
                            <button
                              onClick={(e) => {
                                id.current = user._id;
                                deleteUser(e);
                              }}
                              className="w-auto h-10 max-w-full px-4 py-3 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-red-600 hover:bg-red-700 rounded-md outline-none opacity-100 cursor-pointer focus:ring"
                            >
                              <svg
                                className="w-5 h-5 mr-1 -ml-1 inline"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                              <span className="font-medium text-center">
                                {" "}
                                Delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                {users.loading === false && users.results.length === 0 && (
                  <div className="flex items-center justify-center">
                    <div className="p-6 m-10 max-w-sm mx-auto bg-cold-blue  rounded-xl shadow-md flex items-center space-x-4">
                      <div className="text-xl text-center font-medium text-mint">
                        No Users Exist
                      </div>
                    </div>
                  </div>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          reviewsPerPage={10}
          totalReviews={users.results.length}
          paginate={paginateUsers}
        />
      </div>
    </section>
  );
};

export default Users;
