import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import "../resources/becomeHost.css";
import BackButton from "../components/BackButton";
import { becomeCarOwner, getUserProfile } from "../api/userAPI";
import Loading from "../components/Loading";

const BecomeHost = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(undefined);
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const benefits = [
    {
      title: "Earn Extra Income",
      content: "Monetize your vehicle by renting it out during idle times.",
    },
    {
      title: "Flexibility and Control",
      content: "Set your own schedule, prices, and rental preferences.",
    },
    {
      title: "Wide Exposure",
      content: "Reach more renters through our trusted platform.",
    },
    {
      title: "Hassle-Free Payments",
      content: "Receive secure, timely payments automatically.",
    },
    {
      title: "Eco-Friendly Impact",
      content: "Support sustainability by enabling car sharing.",
    },
  ];

  const terms = [
    "Your vehicle must meet platform safety and eligibility requirements.",
    "Listings must be accurate with current pricing and availability.",
    "You must follow renter safety policies and legal obligations.",
    "Provide a clean, well-maintained vehicle every rental.",
  ];

  // Fetch user profile on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUser(null);
          return;
        }
        const userData = await getUserProfile(token);
        setUser(userData);
      } catch (err) {
        console.error("Failed to fetch user profile:", err.message);
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleContinue = async () => {
    if (!isChecked) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in.");
        return;
      }

      await becomeCarOwner(token);
      navigate("/");
    } catch (err) {
      console.error("Failed to become car owner:", err.response?.data?.message);
      setError("Something went wrong. Please try again.");
    }
  };

  if (user === undefined) return <Loading />;

if (user?.isCarOwner) {
  return (
    <div
      style={{
        display: "flex",
        height: "90vh",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        flexDirection: "column",
        padding: "20px",
      }}
    >
      <div id="become-host-back-button" style={{ position: "absolute", top: "20px", left: "20px" }}>
        <BackButton />
      </div>
      <div className="already-host-message">
        <h1>You are already a host!</h1>
        <p>
          Thanks for contributing your car to the community. You can manage
          your listings from your dashboard.
        </p>
        <div
          style={{
            marginTop: "20px",
            width: "50%",
            marginLeft: "auto",
            marginRight: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Button text="Go to Home" onClick={() => navigate("/")} />
        </div>
      </div>
    </div>
  );
}

  return (
    <div id="become-host-page">
      <BackButton />
      <h1>Benefits of becoming a host</h1>
      <ol id="benefits">
        {benefits.map((b, i) => (
          <li key={i}>
            <strong>{b.title}:</strong> {b.content}
          </li>
        ))}
      </ol>
      <img src="/images/car-key.png" alt="car keys" id="car-keys" />

      <h1>Terms and Conditions</h1>
      <p>By signing up, you agree to:</p>
      <ul id="terms">
        {terms.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>

      <label className="custom-checkbox">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => {
            setIsChecked(e.target.checked);
            if (e.target.checked) setError("");
          }}
        />
        <span className={`checkmark ${!isChecked && error ? "red-box" : ""}`}></span>
        <span className="checkbox-label">I agree to the terms and conditions.</span>
      </label>

      {error && <p className="error-message">{error}</p>}

      <div id="continue-button">
        <Button text="Continue" onClick={handleContinue} />
      </div>
    </div>
  );
};

export default BecomeHost;
