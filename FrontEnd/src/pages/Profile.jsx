import React, { useEffect, useRef, useState } from "react";
import { TbViewportWide } from "react-icons/tb";
import { MdEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import ViewModal from "../components/ViewModal";
import EditModal from "../components/EditModal";
import DeleteModal from "../components/DeleteModal";
import { getAuthToken, getAuthUser } from "../helper/Storage";
import toast from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import ExpertsModal from "../components/ExpertsModal";
import { FaEye, FaCheck, FaTimes } from "react-icons/fa";
import Pagination from "../components/Pagination";

const Profile = () => {
  const user = getAuthUser();
  const navigate = useNavigate();
  const auth = getAuthToken();
  let respStatus2 = useRef("fail");
  let applicationAccepted = useRef("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [applications, setApplications] = useState({
    results: [],
    loading: false,
    reload: 0,
  });
  const [questions, setQuestions] = useState({
    question1: "",
    question2: "",
    question3: "",
    question4: "",
    question5: "",
    question6: "",
    question7: "",
    question8: "",
    question9: "",
    question10: "",
  });

  const [showExpertsModal, setShowExpertsModal] = useState(false);
  // const handleEditClick = (productId) => {
  //   setCurrentProductId(productId);
  //   navigate(`/updateproduct/${currentProductId}`);
  // };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setCurrentProductId(null);
  };

  const [localInfo, setLocalInfo] = useState({
    name: "",
    role: "",
    email: "",
    photo: null,
  });
  const [condition, setCondition] = useState({
    status: "fail",
    loading: true,
  });

  const [changePass, setChangePass] = useState({
    password: "",
    passwordConfirm: "",
    passwordCurrent: "",
    status: "fail",
    loading: true,
  });

  const [products, setProducts] = useState({
    results: [],
    reload: 0,
    loading: true,
    status: "fail",
  });
  const [orders, setOrders] = useState({
    results: [],
    createdAt: "",
    loading: true,
  });

  const [activeTab, setActiveTab] = useState("profile");
  const handleButtonClick = (tabName) => {
    setActiveTab(tabName);
  };
  const [q, setQ] = useState("");

  const [searchParam] = useState([
    "harmfultoenv",
    "onSale",
    "name",
    "category",
  ]);
  const [searchOrd] = useState(["price", "name", "createdAt", "category"]);
  const [searchApps] = useState(["applicationStatus"]);

  const viewProducts = (e) => {
    e.preventDefault();

    if (user.role === "admin") {
      axios
        .get(`http://localhost:3000/api/v1/products`)
        .then((resp) => {
          respStatus2.current = resp.data.status;
          setProducts({
            ...products,
            results: resp.data.data.data,
            status: resp.data.status,
            loading: false,
            reload: products.reload + 1,
          });
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });
          setProducts({
            ...products,
            status: respStatus2.current,
            loading: false,
            reload: products.reload + 1,
          });
        });
    } else if (user.role === "company") {
      axios
        .get(
          `http://localhost:3000/api/v1/products/myProducts/${user._id}`,

          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          respStatus2.current = resp.data.status;
          setProducts({
            ...products,
            results: resp.data.data.data,
            status: resp.data.status,
            loading: false,
            reload: products.reload + 1,
          });
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });
          setProducts({
            ...products,
            status: respStatus2.current,
            loading: false,
            reload: products.reload + 1,
          });
        });
    }
  };

  const viewOrders = (e) => {
    e.preventDefault();

    axios
      .get(
        `http://localhost:3000/api/v1/myOrders`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setOrders({
          ...orders,
          results: resp.data.orders,
          loading: false,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setOrders({
          ...orders,
          loading: false,
        });
      });
  };
  const editProfile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", localInfo.name);
    formData.append("email", localInfo.email);
    formData.append("photo", localInfo.photo);

    axios
      .patch(`http://localhost:3000/api/v1/users/updateMe`, formData, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Profile Is Successfully Updated!");

          // Show success message
          setLocalInfo({ ...localInfo });
          setCondition({
            ...condition,
            status: resp.data.status,
            loading: false,
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setLocalInfo({ ...localInfo });
        setCondition({ ...condition, status: "error", loading: false });
      });
  };

  const changePassword = (e) => {
    e.preventDefault();
    // try {

    axios
      .patch(
        `http://localhost:3000/api/v1/users/updateMyPassword`,
        {
          password: changePass.password,
          passwordConfirm: changePass.passwordConfirm,
          passwordCurrent: changePass.passwordCurrent,
        },
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Password Is Successfully Updated!");

          setChangePass({
            ...changePass,
            status: resp.data.status,
            loading: false,
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setChangePass({
          ...changePass,
          status: "error",
          loading: false,
        });
      });
  };

  const deleteUser = (e) => {
    e.preventDefault();
    // try {

    axios
      .patch(
        `http://localhost:3000/api/v1/users/deleteMe`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Account Is Successfully Deactivated!");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
      });
  };

  const removeItem = (e, id) => {
    e.preventDefault();
    setProducts({ ...products, loading: true });

    axios
      .delete(`http://localhost:3000/api/v1/products/myProducts/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Deleted Successfully");
        }
        setProducts({
          ...products,
          loading: false,
          reload: products.reload + 1,
        });
        setActiveTab("products");
        viewProducts(e);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
        setProducts({
          ...products,
          loading: false,
          reload: products.reload + 1,
        });
      });
  };

  const applyBadge = (e) => {
    e.preventDefault();

    axios
      .get(
        `http://localhost:3000/api/v1/applyCertificate`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Applied For Badge Successfully");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(err.response.data.message);
      });
  };

  const removeDiscount = (e, onSaleId) => {
    e.preventDefault();
    console.log(auth);
    axios
      .patch(
        `http://localhost:3000/api/v1/products/noDiscount/${onSaleId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Removed Discount Successfully");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };
  const ApplyAsExpert = (e) => {
    e.preventDefault();
    console.log(auth);
    axios
      .post(`http://localhost:3000/api/v1/expertApply`, questions, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success(resp.data.message);
          navigate("/");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  useEffect(() => {
    if (activeTab === "experts_list") {
      setApplications({ ...applications, loading: true });
      axios
        .get(
          `http://localhost:3000/api/v1/expertApply`,

          {
            headers: {
              Authorization: `Bearer ${auth.jwtToken}`,
            },
          }
        )
        .then((resp) => {
          setApplications({
            ...applications,
            results: resp.data.data,
            status: resp.data.status,
            loading: false,
          });
          setActiveTab("experts_list");
        })
        .catch((err) => {
          toast.error(err.response.data.message, {
            className: "w-auto",
          });
          setApplications({
            ...applications,
            loading: false,
          });
        });
    }
  }, [activeTab, applications.reload]);

  const deleteApplication = (e, applicationId) => {
    e.preventDefault();
    axios
      .delete(
        `http://localhost:3000/api/v1/expertApply/${applicationId}`,

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        toast.success("Expert Application is Successfully Deleted");
        setApplications({
          ...applications,
          status: resp.data.status,
          loading: false,
          reload: applications.reload + 1,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setApplications({
          ...applications,
          loading: false,
          reload: applications.reload + 1,
        });
      });
  };

  const reviewApplication = (e, applicationId) => {
    e.preventDefault();
    console.log(applicationAccepted);
    axios
      .patch(
        `http://localhost:3000/api/v1/expertApply/${applicationId}`,
        {
          applicationStatus: applicationAccepted.current,
        },

        {
          headers: {
            Authorization: `Bearer ${auth.jwtToken}`,
          },
        }
      )
      .then((resp) => {
        toast.success(
          `User's Expert Application Is Successfully ${applicationAccepted.current}`
        );
        setApplications({
          ...applications,
          status: resp.data.status,
          loading: false,
          reload: applications.reload + 1,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setApplications({
          ...applications,
          loading: false,
          reload: applications.reload + 1,
        });
      });
  };

  const [currentApplicationsPage, setCurrentApplicationsPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [currentOrdersPage, setCurrentOrdersPage] = useState(1);

  const indexOfLastApplication = currentApplicationsPage * productsPerPage;
  const indexOfFirstApplication = indexOfLastApplication - productsPerPage;
  const currentApplications = applications.results.slice(
    indexOfFirstApplication,
    indexOfLastApplication
  );

  // Change page

  const paginateApplications = (pageNumber) =>
    setCurrentApplicationsPage(pageNumber);

  const indexOfLastOrder = currentOrdersPage * productsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - productsPerPage;
  const currentOrders = orders.results.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  // Change page

  const paginateOrders = (pageNumber) => setCurrentOrdersPage(pageNumber);

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
      if ("products" == activeTab) {
        return searchParam.some((newItem) => {
          return (
            item[newItem].toString().toLowerCase().indexOf(q.toLowerCase()) > -1
          );
        });
      }
    });
  }

  function searchApplications(items) {
    return items.filter((item) => {
      if ("experts_list" == activeTab) {
        return (
          searchApps.values(item).some((value) => {
            return value.toString().toLowerCase().includes(q.toLowerCase());
          }) ||
          item.user.email.toLowerCase().includes(q.toLowerCase()) ||
          item.user.name.toLowerCase().includes(q.toLowerCase())
        );
      }
    });
  }

  return (
    <section className="grid gap-10 lg:grid-cols-3 max-container padding-container lg:gap-0">
      <div className="text-center lg:text-start">
        <h1 className="text-xl font-bold text-green-600 underline">
          Manage My Account
        </h1>
        <ul className="mt-10 text-lg leading-loose text-cold-blue">
          <li>
            <button
              className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
              onClick={() => handleButtonClick("profile")}
            >
              My Profile
            </button>
          </li>
          {auth && (user.role === "user" || user.role === "expert") && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={(e) => {
                  handleButtonClick("orders");
                  viewOrders(e);
                }}
              >
                My Orders
              </button>
            </li>
          )}
          {auth && user.role === "user" && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("become_an_expert")}
              >
                Expert Application
              </button>
            </li>
          )}
          {auth && (user.role === "company" || user.role === "admin") && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={(e) => {
                  handleButtonClick("products");
                  viewProducts(e);
                }}
              >
                My Products
              </button>
            </li>
          )}
          {auth && user.role === "company" && (
            <li>
              <button
                className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                onClick={() => handleButtonClick("badge")}
              >
                Badge
              </button>
            </li>
          )}

          {auth && user.role === "admin" && (
            <>
              <li>
                <button
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  onClick={() => {
                    handleButtonClick("experts_list");
                  }}
                >
                  Experts List
                </button>
              </li>
              <li>
                <Link
                  className="duration-300 ease-in-out hover:text-green-600 focus:text-green-600"
                  to={"/users"}
                >
                  Users List
                </Link>
              </li>
            </>
          )}
          <li>
            <button
              className="text-red-500 hover:text-red-600"
              onClick={() => handleButtonClick("delete")}
            >
              Deactivate My Account
            </button>
          </li>
        </ul>
      </div>
      <div className="lg:col-span-2">
        {/* tabs for users and company */}
        {activeTab === "profile" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-green-600">
              Edit Your Profile
            </h2>
            <div className="flex flex-col">
              <label className="mt-3">Username</label>
              <input
                type="text"
                className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                name="user"
                required
                placeholder={user.name}
                onChange={(e) =>
                  setLocalInfo({
                    ...localInfo,
                    name: e.target.value,
                  })
                }
              />
              <label className="mt-3">Email</label>
              <input
                type="email"
                className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                name="email"
                required
                placeholder={user.email}
                onChange={(e) =>
                  setLocalInfo({
                    ...localInfo,
                    email: e.target.value,
                  })
                }
              />
              <label className="mx-2 my-2">Role</label>
              <select
                className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px] mt-3"
                required
                placeholder={user.role}
              ></select>

              <label className="mx-2 my-2">Photo</label>
              <input
                id="example1"
                type="file"
                onChange={(e) =>
                  setLocalInfo({
                    ...localInfo,
                    photo: e.target.files[0],
                  })
                }
                className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cold-blue file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-black focus:outline-none disabled:pointer-events-none disabled:opacity-60"
              />
              <input
                type="submit"
                onClick={editProfile}
                className="h-[50px] w-full hover:bg-black cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3"
                value="Apply"
              />

              <div className="flex flex-col gap-4 mt-10">
                <h2 className="text-xl my-2 font-bold text-green-600">
                  Change Your Password
                </h2>
                <label>Current Password</label>

                <input
                  type="password"
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Enter Your Current Password"
                  name="currPass"
                  required
                  onChange={(e) =>
                    setChangePass({
                      ...changePass,
                      passwordCurrent: e.target.value,
                    })
                  }
                />
                <label>New Password</label>

                <input
                  type="password"
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                  placeholder="New Password"
                  name="pass1"
                  required
                  onChange={(e) =>
                    setChangePass({
                      ...changePass,
                      password: e.target.value,
                    })
                  }
                />
                <label>Confirm New Password</label>
                <input
                  type="password"
                  className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
                  placeholder="Confirm New Password"
                  name="pass2"
                  required
                  onChange={(e) =>
                    setChangePass({
                      ...changePass,
                      passwordConfirm: e.target.value,
                    })
                  }
                />
              </div>

              <input
                type="submit"
                className="h-[50px] w-full hover:bg-black cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3"
                value="Change Password"
                onClick={changePassword}
              />
            </div>
          </div>
        )}
        {activeTab == "orders" && orders.loading === true && (
          <ClipLoader
            className="color-cold-blue my-2"
            loading={true}
            size={70}
          />
        )}

        {activeTab === "orders" &&
          orders.loading === false &&
          orders.results.length === 0 && (
            <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
              There are no Orders yet
            </div>
          )}

        {auth &&
          (user.role === "user" || user.role === "expert") &&
          activeTab === "orders" &&
          orders.loading === false &&
          orders.results.length > 0 && (
            <>
              {currentOrders.map((order) => {
                return order.products.map((product) => {
                  return (
                    <div
                      key={product.product._id}
                      className="flex flex-col justify-between gap-3 mx-2 my-2 px-2 py-2 border rounded-md xs:flex-row border-cold-blue"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`http://localhost:3000/img/${product.product.category}/${product.product.imageCover}`}
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
                paginate={paginateOrders}
              />
              ;
            </>
          )}
        {activeTab == "experts_list" && applications.loading === true && (
          <ClipLoader
            className="color-cold-blue my-2"
            loading={true}
            size={70}
          />
        )}

        {activeTab === "experts_list" &&
          applications.loading === false &&
          applications.results.length === 0 && (
            <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
              There are no applications yet
            </div>
          )}

        {activeTab === "experts_list" &&
          applications.loading === false &&
          currentApplications.length > 0 && (
            <section className="max-container padding-container">
              <div className="max-w-screen-lg px-4 py-8 mx-auto sm:px-8">
                <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
                  <label htmlFor="search-form">
                    <input
                      type="search"
                      name="search-form"
                      id="search-form"
                      className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
                      placeholder="Search for Applications..."
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
                    <h2 className="text-xl font-semibold text-green-600">
                      Experts List
                    </h2>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="ml-10 space-x-8 lg:ml-40"></div>
                  </div>
                </div>
                <div className="overflow-y-hidden border rounded-lg">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-xs font-semibold tracking-widest text-left text-white uppercase bg-green-600">
                          <th className="px-5 py-3">Application ID</th>
                          <th className="px-5 py-3">Full Name</th>
                          <th className="px-5 py-3">Email</th>
                          <th className="px-5 py-3">Status</th>
                          <th className="px-5 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-500">
                        {searchApplications(currentApplications).map(
                          (application) => (
                            <tr key={application._id}>
                              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                <p className="whitespace-no-wrap">
                                  {application._id}
                                </p>
                              </td>
                              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 w-10 h-10">
                                    {/* {application.user.photo != null && (
                                      <img
                                        className="w-full h-full rounded-full"
                                        src={`http://localhost:3000/img/users/${application.user.photo}`}
                                        alt=""
                                      />
                                    )} */}
                                  </div>
                                  <div className="ml-3">
                                    <p className="whitespace-no-wrap">
                                      {application.user.name}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                <p className="whitespace-no-wrap">
                                  {application.user.email}
                                </p>
                              </td>
                              {application.user.active === true ? (
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                  <p className="whitespace-no-wrap text-green-500">
                                    ACTIVE
                                  </p>
                                </td>
                              ) : (
                                <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                  <p className="whitespace-no-wrap text-black">
                                    INACTIVE
                                  </p>
                                </td>
                              )}

                              <td className="px-5 py-5 text-sm bg-white border-b border-gray-200">
                                <div className="flex space-x-2">
                                  <button
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => {
                                      setShowExpertsModal(true);
                                    }}
                                  >
                                    <FaEye size={24} />
                                  </button>
                                  {showExpertsModal && (
                                    <ExpertsModal
                                      appId={application._id}
                                      onClose={() => setShowExpertsModal(false)}
                                    />
                                  )}
                                  <button
                                    className="text-green-500 hover:text-green-700"
                                    onClick={(e) => {
                                      applicationAccepted.current = "approved";
                                      reviewApplication(e, application._id);
                                    }}
                                  >
                                    <FaCheck size={24} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      applicationAccepted.current = "rejected";
                                      reviewApplication(e, application._id);
                                    }}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <FaTimes size={24} />
                                  </button>
                                  <button
                                    className="text-xl"
                                    onClick={(e) => {
                                      deleteApplication(e, application._id);
                                    }}
                                  >
                                    <MdDelete color="red" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Pagination
                  reviewsPerPage={10}
                  totalReviews={applications.results.length}
                  paginate={paginateApplications}
                />
              </div>
            </section>
          )}

        {activeTab == "products" &&
          products.loading === true &&
          products.results.length > 0 && (
            <ClipLoader
              className="color-cold-blue my-2"
              loading={true}
              size={70}
            />
          )}

        {auth &&
          (user.role === "company" || user.role === "admin") &&
          activeTab === "products" &&
          products.loading === false && (
            <>
              <div className="relative flex items-center justify-between max-w-lg px-4 py-2 mx-auto mb-4 border rounded-md border-cold-blue">
                <label htmlFor="search-form">
                  <input
                    type="search"
                    name="search-form"
                    id="search-form"
                    className="flex-grow h-[40px] px-[20px] py-[12px] border-none outline-none rounded-l-md"
                    placeholder="Search for Products..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </label>
              </div>
              {products.results.length > 0 &&
                search(currentProducts).map((product) => {
                  return (
                    <div
                      key={product._id}
                      className="flex flex-col justify-between gap-3 mx-2 my-2 px-2 py-2 border rounded-md xs:flex-row border-cold-blue"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`http://localhost:3000/img/${product.category}/${product.imageCover}`}
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
                paginate={paginate}
              />
            </>
          )}

        {activeTab == "products" && products.results.length === 0 && (
          <div className=" items-center justify-center px-4 py-3 m-2 hover:border-green-300 text-base font-bold text-center text-white transition-all duration-200 ease-in-out border-2 border-transparent rounded-md bg-cold-blue bg-none focus:shadow hover:bg-gray-800">
            You Did Not add Products yet!
          </div>
        )}

        {activeTab === "become_an_expert" && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-green-600">
              Become an Expert
            </h2>
            <div className="flex flex-col">
              <label className="mt-3">
                How would you prioritize tasks if you have multiple products to
                assess but limited time?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question1}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question1: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                Explain the key factors you consider when evaluating the
                environmental impact of a product.
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question2}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question2: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                Describe a scenario where you had to make a quick decision
                without compromising on accuracy.
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question3}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question3: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                What steps do you take to ensure that your assessment of a
                product is thorough and precise?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question4}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question4: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                How do you maintain consistency in your voting when faced with a
                high volume of products to review?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question5}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question5: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                Discuss the importance of impartiality in voting and how you
                uphold ethical standards.
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question6}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question6: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                If a new policy changes the criteria for product assessment, how
                quickly can you adapt your voting strategy?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question7}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question7: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                How would you communicate your expert opinion to a seller whose
                product did not meet the eco-friendly criteria?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question8}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question8: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                How do you handle feedback or criticism regarding your votes
                from other experts or users?
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question9}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question9: e.target.value,
                  })
                }
              ></textarea>

              <label className="mt-3">
                Are you able to commit to making at least one vote every 10
                minutes during your active hours? Please explain your strategy
                for doing so.
              </label>
              <textarea
                className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
                rows="2"
                required
                value={questions.question10}
                onChange={(e) =>
                  setQuestions({
                    ...questions,
                    question10: e.target.value,
                  })
                }
              ></textarea>

              <input
                type="submit"
                className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3 hover:bg-green-600 duration-200 hover-text-cold"
                value="Apply"
                onClick={ApplyAsExpert}
              />
            </div>
          </div>
        )}

        {auth && user.role === "company" && activeTab === "badge" && (
          <div className="text-center lg:text-start">
            <p className="mb-3 text-cold-blue">
              You need to purchase at least
              <span className="text-xl font-semibold text-green-600">
                &nbsp;2 eco-friendly products&nbsp;
              </span>
              to apply for this badge.
            </p>
            <button
              onClick={applyBadge}
              className="px-3 py-2 text-white duration-300 ease-in-out rounded-md bg-cold-blue hover:bg-mint hover:text-cold-blue"
            >
              Apply for Eco-Friendly Badge
            </button>
          </div>
        )}

        {activeTab === "delete" && (
          <div className="text-center lg:text-start">
            <p className="text-cold-blue">
              Are you sure you want to deactivate your account ?
            </p>
            <p className="mb-3 font-semibold text-cold-blue">
              All your data will be{" "}
              <span className="text-xl font-semibold text-red-600">
                Deactivated&nbsp;
              </span>
              !!
            </p>
            <button
              onClick={deleteUser}
              className="px-3 py-2 text-white hover:bg-red-600 bg-red-500 rounded-md"
            >
              Deactivate My Account
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Profile;
