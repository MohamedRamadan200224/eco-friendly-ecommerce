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
import api, {
  isDemoSite,
  userImageUrl,
  handleImgError,
} from "../../api/client";
import { setAuthUser } from "../../helper/Storage";

const EditProfile = ({ user }) => {
  // Initialised from the current user (not empty strings): the old code
  // started name/email as "", so changing only the email still sent
  // name: "", which failed the backend's required-name validation.
  // Inputs are controlled, so what you see is what gets sent.
  const [localInfo, setLocalInfo] = useState({
    name: user?.name || "",
    email: user?.email || "",
    photo: null,
  });
  // Bumped after a successful save so the file input clears (file inputs
  // cannot be controlled, so a key change is the only reset).
  const [photoKey, setPhotoKey] = useState(0);
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
  // In-flight guard for the password change: double-clicking used to fire
  // the request twice, and the second call then 401d because the old
  // password was already changed.
  const [changingPassword, setChangingPassword] = useState(false);

  const editProfile = (e) => {
    e.preventDefault();

    // Send only what changed. The old code appended every field every
    // time — including photo, which with no file chosen became the literal
    // string "null" and overwrote the avatar with /img/users/null.
    const formData = new FormData();
    let hasChanges = false;
    if (localInfo.name !== user.name) {
      formData.append("name", localInfo.name);
      hasChanges = true;
    }
    if (localInfo.email !== user.email) {
      formData.append("email", localInfo.email);
      hasChanges = true;
    }
    if (localInfo.photo instanceof File) {
      formData.append("photo", localInfo.photo);
      hasChanges = true;
    }
    if (!hasChanges) {
      toast("No changes to save.");
      return;
    }

    api
      .patch(`/api/v1/users/updateMe`, formData)
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Profile Is Successfully Updated!");

          // Refresh the stored user from the response: the old code never
          // did, so the Navbar and profile kept showing the old name /
          // email / photo until the next login.
          const updatedUser = resp.data.data.user;
          setAuthUser(updatedUser);
          setLocalInfo({
            name: updatedUser.name,
            email: updatedUser.email,
            photo: null,
          });
          setPhotoKey((key) => key + 1);
          setCondition({
            ...condition,
            status: resp.data.status,
            loading: false,
          });
        }
      })
      .catch(() => {
        // Error already toasted once by the api client interceptor.
        setCondition({ ...condition, status: "error", loading: false });
      });
  };

  const changePassword = (e) => {
    e.preventDefault();
    if (changingPassword) return;

    // Client-side checks: the old code sent whatever was typed, so empty
    // fields produced a misleading "Your current password is wrong" 401
    // and mismatched new passwords only failed server-side.
    if (
      !changePass.passwordCurrent ||
      !changePass.password ||
      !changePass.passwordConfirm
    ) {
      toast.error("Fill in all three password fields.");
      return;
    }
    if (changePass.password !== changePass.passwordConfirm) {
      toast.error("The new passwords do not match.");
      return;
    }

    setChangingPassword(true);
    api
      .patch(`/api/v1/users/updateMyPassword`, {
        password: changePass.password,
        passwordConfirm: changePass.passwordConfirm,
        passwordCurrent: changePass.passwordCurrent,
      })
      .then((resp) => {
        if (resp.data.status === "success") {
          toast.success("Password Is Successfully Updated!");

          // Clear all three fields: the old code left the (now changed)
          // passwords sitting in the form.
          setChangePass({
            password: "",
            passwordConfirm: "",
            passwordCurrent: "",
            status: resp.data.status,
            loading: false,
          });
        }
        setChangingPassword(false);
      })
      .catch(() => {
        setChangingPassword(false);
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
          value={localInfo.name}
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
          value={localInfo.email}
          onChange={(e) =>
            setLocalInfo({
              ...localInfo,
              email: e.target.value,
            })
          }
        />
        {/* No role field: there is intentionally no way to change roles
            from the UI (roles are admin-only server-side), and the old
            <select> was empty and dead. */}

        {/* Current photo (local person placeholder when there is none)
            so the user can see what is stored before replacing it. */}
        <img
          src={userImageUrl(user?.photo)}
          onError={handleImgError(user?.name, "person")}
          alt={user?.name || "Profile photo"}
          className="w-24 h-24 rounded-full object-cover"
        />

        <label className="mx-2 my-2">Photo</label>
        <input
          id="example1"
          key={photoKey}
          type="file"
          accept="image/*"
          disabled={isDemoSite()}
          onChange={(e) =>
            setLocalInfo({
              ...localInfo,
              photo: e.target.files[0],
            })
          }
          className="mt-2 block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-cold-blue file:py-2 file:px-4 file:text-sm file:font-semibold file:text-white hover:file:bg-black focus:outline-none disabled:pointer-events-none disabled:opacity-60"
        />
        {isDemoSite() && (
          <div className="rounded-md border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Photo upload isn&apos;t available in the demo — the photo would
            fail the whole save on this hosting. Your name and email can
            still be updated.
          </div>
        )}
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
            value={changePass.passwordCurrent}
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
            value={changePass.password}
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
            value={changePass.passwordConfirm}
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
          className="h-[50px] w-full hover:bg-black cursor-pointer rounded-[200px] bg-cold-blue px-[20px] py-[12px] font-bold text-white mt-3 disabled:opacity-60"
          value={changingPassword ? "Changing…" : "Change Password"}
          disabled={changingPassword}
          onClick={changePassword}
        />
      </div>
    </div>
  );
};

export default EditProfile;
