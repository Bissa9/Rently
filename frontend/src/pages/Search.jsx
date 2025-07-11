import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import "../resources/search.css";
import SearchBar from "../components/SearchBar";
import CheckBox from "../components/CheckBox";
import { FiX } from "react-icons/fi";
import { getCars } from "../api/carsAPI";
import CarPreview from "../components/CarPreview";
import Pagination from "../components/Pagination";

import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const Search = () => {
  const today = new Date();
  const location = useLocation();
  const state = location.state || {};

  const pageContent = useRef(null);

  const [cars, setCars] = useState([]); // Store all cars
  const [currentPage, setCurrentPage] = useState(0); // Current page index
  const [pageSize] = useState(10); // Cars per page
  const [totalCars, setTotalCars] = useState(0); // Total cars count
  const [searchParams, setSearchParams] = useSearchParams();
  const [openSections, setOpenSections] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState(state.location || "");
  const [fromDate, setFromDate] = useState(state.from || today);
  const [untilDate, setUntilDate] = useState(
    state.until ||
      new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
  );

  const minFromUrl = parseInt(searchParams.get("minPrice")) || 100;
  const maxFromUrl = parseInt(searchParams.get("maxPrice")) || 30000;

  const [minPrice, setMinPrice] = useState(minFromUrl);
  const [maxPrice, setMaxPrice] = useState(maxFromUrl);

  const defaultFilters = {
    "Car Brands": [],
    "Car Types": [],
    "Car Seats": [],
    "Car Transmission": [],
    "Advanced Filters": [],
  };

  const [selectedFilters, setSelectedFilters] = useState(() => {
    const filtersFromURL = { ...defaultFilters };
    for (const category of Object.keys(defaultFilters)) {
      const paramKey = category.replace(/\s+/g, "_");
      const values = searchParams.getAll(paramKey);
      if (values.length > 0) filtersFromURL[category] = values;
    }
    return filtersFromURL;
  });

  const filterGroups = [
    {
      category: "Car Brands",
      items: ["MG", "Nissan", "Audi", "BMW", "Mercedes", "Ford", "Kia", "Opel"],
    },
    {
      category: "Car Types",
      items: [
        "SUV",
        "Coupe",
        "Luxury",
        "Sports",
        "Hatchback",
        "Sedan",
        "Cabriolet",
      ],
    },
    { category: "Car Seats", items: ["2 seats", "5 seats", "6 seats or more"] },
    { category: "Car Transmission", items: ["Automatic", "Manual"] },
    { category: "Advanced Filters", items: ["Electric", "Special needs"] },
  ];

  const toggleSection = (category) => {
    setOpenSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const toggleSelection = (category, item) => {
    setSelectedFilters((prev) => {
      const updatedCategory = prev[category].includes(item)
        ? prev[category].filter((i) => i !== item)
        : [...prev[category], item];
      const newParams = new URLSearchParams(searchParams);
      const key = category.replace(/\s+/g, "_");
      newParams.delete(key);
      updatedCategory.forEach((val) => newParams.append(key, val));
      setSearchParams(newParams);

      return { ...prev, [category]: updatedCategory };
    });
  };

  const fetchCars = async () => {
    const queryParams = {};

    if (selectedFilters["Car Brands"].length > 0)
      queryParams.make = selectedFilters["Car Brands"];

    if (selectedFilters["Car Types"].length > 0)
      queryParams.type = selectedFilters["Car Types"];

    if (selectedFilters["Car Seats"].length > 0) {
      const seatConditions = selectedFilters["Car Seats"].map((label) => {
        if (label === "2 seats") return "2 seats";
        if (label === "5 seats") return "5 seats";
        if (label === "6 seats or more") return "6 seats or more";
        return null;
      });
      queryParams.seats = seatConditions;
    }

    if (selectedFilters["Car Transmission"].length > 0)
      queryParams.transmissionType = selectedFilters["Car Transmission"];

    if (selectedFilters["Advanced Filters"].includes("Electric"))
      queryParams.fuelType = "Electric";

    if (selectedFilters["Advanced Filters"].includes("Special needs"))
      queryParams.disabled = true;

    queryParams.startDate = fromDate.toISOString().replace("Z", "+00:00");
    queryParams.endDate = untilDate.toISOString().replace("Z", "+00:00");

    queryParams.minPrice = minPrice;
    queryParams.maxPrice = maxPrice;

    if (searchText.trim()) {
      queryParams.search = searchText.trim(); // Optional search input
    }

    try {
      const res = await getCars(queryParams);
      if (res && res.data) {
        setCars(res.data.cars);
        setTotalCars(res.data.cars?.length);
        setCurrentPage(0); // reset pagination to first page
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
    }
  };

  const scrollTop = (scrollTo) => {
    if (scrollTo?.current) {
      scrollTo.current.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 800) {
        setIsFilterOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    fetchCars();
    scrollTop(pageContent);
  }, [selectedFilters]);

  const paginatedCars = cars?.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  return (
    <div id="search-container">
      <SearchBar
        fromDate={fromDate}
        setFromDate={setFromDate}
        untilDate={untilDate}
        setUntilDate={setUntilDate}
        setIsFilterOpen={setIsFilterOpen}
        searchText={searchText}
        onSearchChange={setSearchText}
        onSearchClick={fetchCars}
      />

      <div id="search-page-content" className="search-page-content">
        <div className={isFilterOpen ? "filter-open" : "filter-section"}>
          <h1>{isFilterOpen ? "Search by" : "Filters"}</h1>
          <FiX
            className="close-filter-btn"
            onClick={() => setIsFilterOpen(false)}
          />

          <div className="filter-groups-container">
            {filterGroups.map(({ category, items }, index) => (
              <React.Fragment key={category}>
                <div className="collapsible-section">
                  <button
                    className="collapsible-header"
                    onClick={() => toggleSection(category)}
                  >
                    <h3>{category}</h3>
                    <span
                      className={`arrow ${
                        openSections[category] ? "open" : ""
                      }`}
                    >
                      &#9662;
                    </span>
                  </button>

                  {openSections[category] && (
                    <div className="collapsible-content">
                      {items.map((item) => (
                        <CheckBox
                          key={item}
                          label={item}
                          checked={selectedFilters[category]?.includes(item)}
                          onChange={() => toggleSelection(category, item)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* 👉 Inject Price Filter right after Advanced Filters */}
                {category === "Advanced Filters" && (
                  <div className="collapsible-section price-filter">
                    <h3>Daily Price</h3>
                    <div className="price-values">
                      <span>EGP {minPrice}</span> — <span>EGP {maxPrice}</span>
                    </div>

                    <div className="price-slider-wrapper">
                      <Slider
                        range
                        min={0}
                        max={10000}
                        value={[minPrice, maxPrice]} // ✅ Use value, not defaultValue
                        onChange={([min, max]) => {
                          setMinPrice(min);
                          setMaxPrice(max);

                          const newParams = new URLSearchParams(searchParams);
                          newParams.set("minPrice", min);
                          newParams.set("maxPrice", max);
                          setSearchParams(newParams);
                        }}
                        step={50} // optional: makes it slide in steps of 50
                        trackStyle={[{ backgroundColor: "#FF6B35" }]}
                        handleStyle={[
                          { borderColor: "#FF6B35" },
                          { borderColor: "#FF6B35" },
                        ]}
                        railStyle={{ backgroundColor: "#ddd" }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div id="found-cars" ref={pageContent}>
          {paginatedCars?.length > 0 ? (
            <>
              {paginatedCars.map((car) => (
                <CarPreview key={car._id} car={car} />
              ))}

              <Pagination
                totalCars={totalCars}
                pageSize={pageSize}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                scrollRef={pageContent}
              />
            </>
          ) : (
            <p id="no-cars-found">No cars found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
