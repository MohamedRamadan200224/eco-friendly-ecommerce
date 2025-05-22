import React from "react";
import { Link } from "react-router-dom";
const Pagination = ({ reviewsPerPage, totalReviews, paginate }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalReviews / reviewsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav>
      <ul className=" w-full pagination flex whitespace-wrap  place-content-center h-12 w-12 rounded-full m-5 p-10  cursor-pointer  transition-all">
        {pageNumbers.map((number) => (
          <li key={number} className="page-item mx-4">
            <Link
              onClick={() => paginate(number)}
              className="page-link text-green-500 text-xl leading-tight focus:outline-none focus:shadow-outline py-3 px-3 rounded-full hover:bg-green-700  hover:text-white transition-all"
            >
              {number}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Pagination;
