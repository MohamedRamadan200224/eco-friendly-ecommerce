import React from "react";
import { Link } from "react-router-dom"; // Assuming you're using React Router for navigation

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="mb-4 text-4xl font-bold text-green-600">404 Not Found</h1>
      <p className="mb-8 text-lg text-gray-700">
        Oops! The page you are looking for does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 text-black transition duration-300 ease-in-out rounded-md bg-mint hover:bg-green-600 hover:text-white"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFound;
