import axios from "axios";
import React, { useRef } from "react";
import toast from "react-hot-toast";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { getAuthToken } from "../helper/Storage";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const DeleteModal = ({ onClose, id }) => {
  // Your DeleteModal component code...

  DeleteModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired, // or PropTypes.number, depending on what type your id is
  };
  const auth = getAuthToken();
  const navigate = useNavigate();
  console.log(id);

  const removeItem = (e) => {
    e.preventDefault();

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
        navigate("/profile");
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

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
          <button
            onClick={removeItem}
            className="px-10 py-2 bg-red-600 rounded-md"
          >
            <MdDelete size={35} color="white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
