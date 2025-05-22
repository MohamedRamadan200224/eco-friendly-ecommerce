import React from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

const UserModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col max-w-full gap-5 mt-10 text-cold-blue sm:w-auto">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col items-center gap-5 px-4 py-10 mx-4 bg-white sm:px-20 rounded-xl">
          <input
            type="text"
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            placeholder="Username*"
            name="user"
            required
          />
          <input
            type="email"
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            placeholder="Email*"
            name="email"
            required
          />
          <input
            type="password"
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            placeholder="Password*"
            name="pass1"
            required
          />
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
          >
            <option selected>Choose a role</option>
            <option value="user">User</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
