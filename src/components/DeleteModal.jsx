import React from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdDelete } from "react-icons/md";

const DeleteModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col gap-5 mt-10 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col items-center gap-5 px-20 py-10 mx-4 bg-white rounded-xl text-cold-blue">
          <h1>
            Are you sure you want to
            <span className="text-xl font-semibold text-red-600 uppercase">
              &nbsp;delete&nbsp;
            </span>
            this product ?
          </h1>
          <button className="px-10 py-2 bg-red-600 rounded-md">
            <MdDelete size={35} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
