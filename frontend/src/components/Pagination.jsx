import React from "react";
import ReactPaginate from "react-paginate";
import "../resources/pagination.css";

const Pagination = ({ totalCars, pageSize, currentPage, setCurrentPage, scrollRef }) => {
 const handlePageChange = (selectedPage) => {
  setCurrentPage(selectedPage.selected);

  if (scrollRef?.current) {
scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
 window.scrollTo({ top: 0, behavior: "smooth" });
  }else {
    window.scrollTo({ top: 0, behavior: "smooth" });

  }

};


  return (
    <ReactPaginate
      pageCount={Math.ceil(totalCars / pageSize)}
      pageRangeDisplayed={5}
      marginPagesDisplayed={2}
      onPageChange={handlePageChange}
      containerClassName="result-pagination"
      pageClassName="page-item"
      previousClassName="pagination-prev"
      nextClassName="pagination-next"
      activeClassName="pagination-active"
      disabledClassName="pagination-disabled"
      previousLabel="Previous"
      nextLabel="Next"
      forcePage={currentPage} // Keeps ReactPaginate in sync with state
    />
  );
};

export default Pagination;
