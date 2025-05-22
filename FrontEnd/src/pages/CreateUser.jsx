import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router";
import "react-toastify/dist/ReactToastify.css";
import { getAuthToken } from "../helper/Storage";
import { toast } from "react-hot-toast";
import { useParams } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  let respStatus2 = useRef("fail");
  const { id } = useParams();
  const [user, setUser] = useState({
    result: {},
  });
  const [userCondition, setUserCondition] = useState({
    reload: 0,
    loading: true,
  });

  useEffect(() => {
    axios
      .get(`http://localhost:3000/api/v1/users/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        respStatus2.current = resp.data.status;
        setUser({
          ...user,
          result: resp.data.data.data,
        });
        setUserCondition({
          ...userCondition,
          loading: false,
        });
      })
      .catch((err) => {
        toast.error(err.response.data.message, {
          className: "w-auto",
        });
        setUser({
          ...user,
        });
        setUserCondition({
          ...userCondition,
          loading: false,
        });
      });
  }, [userCondition.reload]);

  const createUser = (e) => {
    e.preventDefault();
    setUser({
      ...user,
    });

    toast.loading("Updating User...", {
      duration: 500,
    });

    const formData = new FormData();
    formData.append("name", user.result.name);
    formData.append("email", user.result.email);
    formData.append("photo", user.result.photo);
    formData.append("role", user.result.role);
    formData.append("password", user.result.password);
    formData.append("passwordConfirm", user.result.passwordConfirm);

    axios
      .post(`http://localhost:3000/api/v1/users`, formData, {
        headers: {
          Authorization: `Bearer ${auth.jwtToken}`,
        },
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Successfully Created User!"); // Show success message
          setUserCondition({
            ...userCondition,
            loading: false,
          });
          navigate("/");
        }
      })
      .catch((err) => {
        toast.error(err.response.data.message); // Show error message
        setUserCondition({
          ...userCondition,
          loading: false,
        });
      });
  };

  return (
    <section className="max-container padding-container mb-[200px] mt-[30px] grid md:grid-cols-2">
      <div>
        <img src="/img_loginsignup.jpg" alt="hero_img" />
      </div>
      <div className="lg:w-[80%]">
        <div className="space-y-3">
          <h1 className="text-[28px] font-bold text-cold-blue">Create User</h1>

          <p className="text-lg text-cold-blue">
            Lets make world better, Together!
          </p>
        </div>
        <form method="POST" className="flex flex-col gap-10 mt-10">
          <label>User Name</label>
          <input
            type="text"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            placeholder={user.result.name}
            required
            name="userName"
            value={user.result.name}
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, name: e.target.value },
              })
            }
          />
          <label>Email</label>
          <input
            type="email"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            placeholder={user.result.email}
            required
            name="useremail"
            value={user.result.email}
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, email: e.target.value },
              })
            }
          />
          <label>Password</label>
          <input
            type="password"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            placeholder={user.result.password}
            required
            name="userpassword"
            value={user.result.password}
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, password: e.target.value },
              })
            }
          />
          <label>Password Confirm</label>
          <input
            type="password"
            className="h-[50px] rounded-[200px] border border-cold-blue px-[20px] py-[12px]"
            placeholder={user.result.passwordConfirm}
            required
            name="userpasswordconfirm"
            value={user.result.passwordConfirm}
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, passwordConfirm: e.target.value },
              })
            }
          />

          <label>Photo</label>
          <input
            id="example1"
            type="file"
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, photo: e.target.files[0] },
              })
            }
            className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cold-blue file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-black focus:outline-none disabled:pointer-events-none disabled:opacity-60"
          />
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
            placeholder={user.result.role}
            value={user.result.role}
            onChange={(e) =>
              setUser({
                ...user,
                result: { ...user.result, role: e.target.value },
              })
            }
          >
            <option selected>Choose a Role</option>
            <option value="user">User</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>

          <div className="flex flex-col gap-5">
            <input
              type="submit"
              className="h-[50px] w-full cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white"
              value="Create User"
              onClick={createUser}
            />
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateUser;
