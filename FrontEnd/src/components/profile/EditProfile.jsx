// "My Profile" tab of the profile page, extracted from Profile.jsx.
//
// Owns editing the profile (name / email / photo) and changing the
// password. Props are minimal and explicit:
//   user — the logged-in user from getAuthUser()
//
// All requests go through the shared api client (cookie auth, one shared
// error toast). No raw axios, no hardcoded backend URL, no Authorization
// header: the old `Bearer ${auth.jwtToken}` headers are gone — auth is
// the httpOnly cookie now, and getAuthToken() returns undefined anyway.
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/client";

const EditProfile = ({ user }) => {
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

  const editProfile = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", localInfo.name);
    formData.append("email", localInfo.email);
    formData.append("photo", localInfo.photo);

    api
      .patch(`/api/v1/users/updateMe`, formData)
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
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setLocalInfo({ ...localInfo });
        setCondition({ ...condition, status: "error", loading: false });
      });
  };

  const changePassword = (e) => {
    e.preventDefault();

    api
      .patch(`/api/v1/users/updateMyPassword`, {
        password: changePass.password,
        passwordConfirm: changePass.passwordConfirm,
        passwordCurrent: changePass.passwordCurrent,
      })
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
      .catch(() => {
        setChangePass({
          ...changePass,
          status: "error",
          loading: false,
        });
      });
  };

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-green-600">Edit Your Profile</h2>
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
  );
};

export default EditProfile;
