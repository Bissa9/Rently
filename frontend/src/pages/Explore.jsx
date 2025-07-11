import React from "react";
import { useNavigate  } from "react-router-dom";
import "../resources/explore.css";
import Button from "../components/Button";
const Explore = () => {
  const navigate = useNavigate();
  const steps = [
    {
      src: "/images/explorePage/findCar.png",
      title: "Find the perfect car",
      description: "Filter and find the best car for you",
    },
    {
      src: "/images/explorePage/location.png",
      title: "Select a pickup location",
      description:
        "Collect your car from our convenient locations or have it delivered to you",
    },
    {
      src: "/images/explorePage/rent.png",
      title: "Rent & hit the road",
      description: `Your host sends your pickup  
details and you’re all set.`,
    },
  ];
  function toggleToSearch() {
     navigate("/search");
  }
  return (
    <div className="page-content">
      <h1>How Rently Works?</h1>

      <div className="steps-container">
        {steps.map((step, index) => (
          <div className="step-container" key={index}>
            <img src={step.src} className="images" alt={step.title} />
            <h3>{`${index + 1}. ${step.title}`}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>

      <div className="button-container">
        <Button text='Find your car' onClick={toggleToSearch}/>
      </div>
    </div>
  );
};

export default Explore;
