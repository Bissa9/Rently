import React from "react";
import { FaMapMarkerAlt, FaSlidersH } from "react-icons/fa";
import BackButton from "./BackButton";
import Button from "./Button";
import DateInput from "./DateInput";

const SearchBar = ({
  fromDate,
  setFromDate,
  untilDate,
  setUntilDate,
  setIsFilterOpen,
  searchText,
  onSearchChange,
  onSearchClick,
}) => {
  return (
    <div id="search-bar">
       <div className='search-bar-back-btn' ><BackButton color="white" /></div>
      <div className="input-container">
        <input
          type="text"
          placeholder="City"
          className="search-input-field"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <FaMapMarkerAlt className="icon" />
      </div>

      <DateInput
        placeholder={"From"}
        selectedDate={fromDate}
        onChange={setFromDate}
      />

      <DateInput
        placeholder={"Until"}
        selectedDate={untilDate}
        onChange={setUntilDate}
      />
      <div className="buttons-container">
        <Button text={"Search"} onClick={onSearchClick} />
        <div className="filter-toggle" onClick={() => setIsFilterOpen(true)}>
          <FaSlidersH /> <span>Filter</span>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
