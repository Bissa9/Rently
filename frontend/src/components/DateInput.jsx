import React , { useRef }from "react";
import DatePicker from "react-datepicker";
import "../resources/dateInput.css";
import "react-datepicker/dist/react-datepicker.css";
import { FaChevronLeft, FaChevronRight, FaRegCalendar } from "react-icons/fa";
import { useLocation } from "react-router-dom";
const DateInput = ({ label, placeholder, selectedDate, onChange }) => {
  const datepickerRef = useRef(null);
  const location =useLocation();
  const isSearchPage = location.pathname === "/search";
  return (
    <div className={` ${isSearchPage ? "search-page-date-picker" : "date-picker-container"}`}>
      <label>{label}</label>
      <div className="date-picker-wrapper">
        <DatePicker
        ref={datepickerRef}
          selected={selectedDate}
          onChange={onChange}
          showTimeSelect={false}
          dateFormat="dd/MM/yyyy"
          placeholderText={placeholder}
          className= {`${isSearchPage? 'search-input-field':'date-input-field'}`} 
          minDate={new Date()} // Prevents selecting past dates
          maxDate={new Date(2025, 11, 31)} // Prevents selecting beyond December 2025
          onKeyDown={(e) => e.preventDefault()}
          renderCustomHeader={({
            date,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <div className="cutomized-header">
              <FaChevronLeft
                onClick={decreaseMonth}
                disabled={prevMonthButtonDisabled}
                className="header-arrow"
              />
              <span className="month-label">
                {date.toLocaleString("default", { month: "long" })}{" "}
                {date.getFullYear()}
              </span>
              <FaChevronRight
                onClick={increaseMonth}
                disabled={nextMonthButtonDisabled}
                className="header-arrow"
              />
            </div>
          )}
        />
        <FaRegCalendar className={`${isSearchPage?"calendar-icon" :'hide-calendar-icon'}`} onClick={() => datepickerRef.current.setFocus()}/>
      </div>
    </div>
  );
};

export default DateInput;
