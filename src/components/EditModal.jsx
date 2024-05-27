import React from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

const EditModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center p-10 overflow-y-auto bg-black bg-opacity-30 backdrop-blur-sm">
      <div className="flex flex-col w-full h-full gap-5 text-cold-blue">
        <button onClick={onClose} className="place-self-end">
          <IoMdCloseCircleOutline size={30} color="#263238" />
        </button>
        <div className="flex flex-col gap-5 px-2 py-5 mx-2 bg-white sm:px-10 sm:mx-4 rounded-xl">
          <div>
            <div className="grid gap-3">
              <label>Product Name</label>
              <input
                type="text"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
              />
              <label>Product Price</label>
              <input
                type="text"
                className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <label>Specifications</label>
            <textarea
              type="text"
              className="h-[281px] rounded-md border border-cold-blue px-[20px] py-[12px]"
              placeholder="Write here"
              required
              maxLength="5000"
            />
          </div>
          <select
            className="h-[50px] rounded-md border border-cold-blue px-[20px] py-[12px]"
            required
          >
            <option selected>Choose a category</option>
            <option value="food">Food</option>
            <option value="electronics">Electronics</option>
            <option value="cars">Cars</option>
            <option value="cloth">Cloth</option>
          </select>

          <label>Stock Quantity</label>
          <input
            type="text"
            className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
          />

          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="submit"
              className="h-[50px] w-full cursor-pointer rounded-md bg-red-600 px-[20px] py-[12px] font-bold text-white"
              value="Harmful to enviroment !"
            />
            <input
              type="text"
              className="h-[40px] rounded-md border border-cold-blue px-[20px] py-[12px] w-full"
              placeholder="Owner's ID"
            />
          </div>
          <input
            type="submit"
            className="h-[50px] w-full cursor-pointer rounded-md bg-cold-blue px-[20px] py-[12px] font-bold text-white"
            value="Submit"
          />
        </div>
      </div>
    </div>
  );
};

export default EditModal;
