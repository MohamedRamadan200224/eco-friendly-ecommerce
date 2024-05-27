import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";

const Users = () => {
  const auth = getAuthToken();
  let id = useRef("");
  let respStatus2 = useRef("fail");

  const [users, setUsers] = useState({
    results: [],
    loading: true,
    status: "fail",
    reload: 0,
  });
  const [deleteuser, setdeleteUser] = useState({
    loading: true,
    status: "fail",
    reload: 0,
  });

  useEffect(() => {
    const getUsers = async () => {
      axios
        .get(
          `http://localhost:8080/api/v1/users`,

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

    axios
      .delete(
        `http://localhost:8080/api/v1/users/${id.current}`,

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

  return (
    <section className="max-container padding-container">
      <div className="max-w-screen-lg px-4 py-8 mx-auto sm:px-8">
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
                {users.results.length > 0 &&
                  users.results.map((user) => {
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
                                src={"https://dummyimage.com/30x30"}
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
                            <button className="w-auto h-10 max-w-full px-4 py-3 overflow-hidden text-sm font-medium text-center text-white normal-case whitespace-pre bg-green-600 hover:bg-green-700 rounded-md outline-none opacity-100 cursor-pointer focus:ring">
                              Update
                            </button>
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
              </tbody>
            </table>
          </div>
          <div className="flex flex-col items-center px-5 py-5 bg-white border-t sm:flex-row sm:justify-between">
            <span className="text-xs text-gray-600 sm:text-sm">
              Showing 1 to 5 of 12 Entries
            </span>
            <div className="inline-flex mt-2 sm:mt-0">
              <button className="w-12 h-12 mr-2 text-sm font-semibold text-gray-600 transition duration-150 border rounded-full hover:bg-gray-100">
                Prev
              </button>
              <button className="w-12 h-12 text-sm font-semibold text-gray-600 transition duration-150 border rounded-full hover:bg-gray-100">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Users;
