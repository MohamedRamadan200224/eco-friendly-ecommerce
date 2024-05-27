import React from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

const ViewModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col gap-5 mt-10 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col items-center gap-5 px-20 py-10 mx-4 bg-white rounded-xl">
          <h1>UNDER CONSTRUCTION</h1>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
