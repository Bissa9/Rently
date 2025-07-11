import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useRef } from "react";
import { useNavigate  } from "react-router-dom";
import "../resources/home.css";
import Button from "../components/Button";
import Slider from "../components/Slider";
import DateInput from "../components/DateInput";
import CustomerServiceBtn from "../components/CustomerServiceBtn";


const Home = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [fromDate, setFromDate] = useState(today);
  const [untilDate, setUntilDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)
  );
  const [location ,setLocation]=useState('');
  const carBrands = [
    {
      name: "BMW",
      img: "/images/homePage/car-brands/bmw.png",
    },
    {
      name: "Audi",
      img: "/images/homePage/car-brands/audi.png",
    },
    {
      name: "Nissan",
      img: "/images/homePage/car-brands/nissan.png",
    },
    {
      name: "MG",
      img: "/images/homePage/car-brands/MG.png",
    },
    {
      name: "Mercedes",
      img: "/images/homePage/car-brands/mercedes.png",
    },
    {
      name: "Ford",
      img: "/images/homePage/car-brands/ford.png",
    },

    {
      name: "Opel",
      img: "/images/homePage/car-brands/opel.png",
    },
    {
      name: "Kia",
      img: "/images/homePage/car-brands/kia.png",
    },
  ];
  const cities = [
    {
      name: "Alexandria",
      img: "/images/homePage/cities/alex.png",
    },
    {
      name: "Giza",
      img: "/images/homePage/cities/giza.png",
    },
    {
      name: "Cairo",
      img: "/images/homePage/cities/cairo.png",
    },
    {
      name: "Alamein",
      img: "/images/homePage/cities/alamein.png",
    },
    {
      name: "Aswan",
      img: "/images/homePage/cities/aswan.png",
    },
  ];
  const carTypes = [
    {
      name: "SUV",
      img: "/images/homePage/car-types/suv.png",
    },
    {
      name: "Luxury",
      img: "/images/homePage/car-types/luxury.png",
    },
    {
      name: "Coupe",
      img: "/images/homePage/car-types/coupe.png",
    },
    {
      name: "Hatchback",
      img: "/images/homePage/car-types/hatchback.png",
    },
    {
      name: "Sedan",
      img: "/images/homePage/car-types/sedan.png",
    },
    {
      name: "Sport",
      img: "/images/homePage/car-types/sport.png",
    },
    {
      name: "Cabriolet",
      img: "/images/homePage/car-types/cabriolet.png",
    },
  ];
  const brandsRef = useRef(null);
  const typesRef = useRef(null);
  const citiesRef = useRef(null);

  const getCarsByTypes = async (type) => {
    try {
      navigate(`/quick-search?type=${type}`);
    } catch (error) {
      console.error("Error filtering cars:", error);
    }
  };
  const getCarsByMake = async (make) => {
    try {
    
      navigate(`/quick-search?make=${make}`);
    } catch (error) {
      console.error("Error filtering cars:", error);
    }
  };
  const getCarsByLocation = async (location) => {
    try {
      navigate(`/quick-search?location=${location}`);
    } catch (error) {
      console.error("Error filtering cars:", error);
    }
  };

  const toggleToSearch = () => {
  navigate("/search", {
    state: {
      location: location || "",
      from: fromDate,
      until: untilDate,
    },
  });
};
  return (
    <div className="home-page-content">
      <div className="search-section">
        <div className="home-bg-container">
          <img
            src="/images/homePage/background.png"
            className="home-background-img"
            alt="sport-car-img"
          />
        </div>
        <div className="search-box">
          <div className="first-search-box">
            <label>Location</label>
            <input
              type="text"
              placeholder="City"
              value={location}  // Bind the input value to location state
              onChange={(e) => setLocation(e.target.value)}  // Update the location state
            />
          </div>
          <div className="middle-search-box">
            <DateInput
              label="From"
              selectedDate={fromDate}
              onChange={setFromDate}
              placeholder="From"
            />
          </div>
          <div className="last-search-box">
            <DateInput
              label="Until"
              selectedDate={untilDate}
              onChange={setUntilDate}
              placeholder="Until"
            />
          </div>
          <Button text={<FiSearch />} onClick={toggleToSearch} />
        </div>

        <div className="mobile-search-box">
          <div className="search-item">
            <label>Location</label>
           <input
              type="text"
              placeholder="Address"
              value={location}  // Bind the input value to location state
              onChange={(e) => setLocation(e.target.value)}  // Update the location state
            />
          </div>
          <div className="search-item">
            <DateInput
              label="From"
              selectedDate={fromDate}
              onChange={setFromDate}
              placeholder="From"
            />
          </div>
          <div className="search-item">
            <DateInput
              label="Until"
              selectedDate={untilDate}
              onChange={setUntilDate}
              placeholder="Until"
            />
          </div>
          <Button text={"Search for cars"} onClick={toggleToSearch} />
        </div>
      </div>

      <div className="choose-us-container">
        <section>
          <h2>Why Choose Us</h2>
          <p>
            Choose us for a sustainable, safe, and accessible journey. Track
            your carbon footprint, rely on our 24/7 support service, and enjoy a
            wide range of vehicles, including options for disabled drivers. With
            an emergency button feature and an easy booking experience, we’re
            here to make your trip smooth and worry-free.
          </p>
        </section>
        <img src="/images/homePage/customer-loyalty.png" alt="loyalty" />
      </div>
      <div className="how-it-works-container">
        <section>
          <h2>How it works</h2>
          <p>
            New to renting? Discover how easy it is to find your perfect car
          </p>
        </section>
        <div className="explore-btn-container">
          <Button text={"Explore"} onClick={() => navigate("/explore")} />
        </div>
      </div>
      <Slider
        items={carBrands}
        title={"Car Brands"}
        itemRef={brandsRef}
        onItemClick={getCarsByMake}
      />
      <Slider
        items={cities}
        title={"Cities"}
        itemRef={citiesRef}
        onItemClick={getCarsByLocation}
      />
      <Slider
        items={carTypes}
        title={"Car Types"}
        itemRef={typesRef}
        onItemClick={getCarsByTypes}
      /> 
      <CustomerServiceBtn/>
    </div>
  );
};

export default Home;
