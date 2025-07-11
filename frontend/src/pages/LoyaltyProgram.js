import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Layout } from "antd";
import "../resources/loyaltyprogram.css";
import Vouchers from "../components/Vouchers";
import BackButton from "../components/BackButton";
import { getLoyaltyProgram, redeemPoints } from "../api/loyaltyAPI";

function LoyaltyProgram() {
  const navigate = useNavigate();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loyaltyProgram, setLoyaltyProgram] = useState(null);

const fetchPoints = async () => {
  try {
    const token = localStorage.getItem("token");
    const data = await getLoyaltyProgram(token);

if (data && data.loyaltyProgram) {
  setLoyaltyProgram(data.loyaltyProgram);
  setPoints(data.loyaltyProgram.pointsBalance || 0);
} else {
  setLoyaltyProgram({ discountCodes: [] });
  setPoints(0);
}

  } catch (err) {
    console.error("Failed to fetch loyalty program", err);
    setLoyaltyProgram({ discountCodes: [] });
    setPoints(0);
  } finally {
    setLoading(false);
  }
};


  const parsePercentageFromCode = (code) => {
    const parts = code.split("-");
    if (parts.length >= 2) {
      const cost = parseInt(parts[1], 10);
      if (!isNaN(cost)) {
        return cost / 1000;
      }
    }
    return 0;
  };
  useEffect(() => {
    fetchPoints();
  }, []);

  return (
    <div>
      <Layout className="profile-layout">
        <div className="background-wrapper">
          <div className="back-button-z-index">
            <BackButton color="white" />
          </div>

          <div className="waves-background">
            <svg
              id="wave"
              style={{ transform: "rotate(0deg)", transition: "0.3s" }}
              viewBox="0 0 1440 490"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="sw-gradient-0" x1="0" x2="0" y1="1" y2="0">
                  <stop stopColor="rgba(29, 53, 87, 1)" offset="0%" />
                  <stop stopColor="rgba(255, 255, 255, 1)" offset="100%" />
                </linearGradient>
              </defs>
              <path
                fill="url(#sw-gradient-0)"
                d="M0,343L30,310.3C60,278,120,212,180,196C240,180,300,212,360,220.5C420,229,480,212,540,171.5C600,131,660,65,720,106.2C780,147,840,294,900,326.7C960,359,1020,278,1080,269.5C1140,261,1200,327,1260,310.3C1320,294,1380,196,1440,171.5V490H0V343Z"
              />
              <defs>
                <linearGradient id="sw-gradient-1" x1="0" x2="0" y1="1" y2="0">
                  <stop stopColor="rgba(29, 53, 87, 1)" offset="0%" />
                  <stop stopColor="rgba(255, 255, 255, 1)" offset="100%" />
                </linearGradient>
              </defs>
              <path
                fill="url(#sw-gradient-1)"
                style={{ transform: "translate(0, 50px)", opacity: 0.9 }}
                d="M0,147L30,147C60,147,120,147,180,187.8C240,229,300,310,360,318.5C420,327,480,261,540,228.7C600,196,660,196,720,212.3C780,229,840,261,900,294C960,327,1020,359,1080,367.5C1140,376,1200,359,1260,367.5C1320,376,1380,408,1440,424.7V490H0V147Z"
              />
              <defs>
                <linearGradient id="sw-gradient-2" x1="0" x2="0" y1="1" y2="0">
                  <stop stopColor="rgba(29, 53, 87, 1)" offset="0%" />
                  <stop stopColor="rgba(255, 255, 255, 1)" offset="100%" />
                </linearGradient>
              </defs>
              <path
                fill="url(#sw-gradient-2)"
                style={{ transform: "translate(0, 100px)", opacity: 0.8 }}
                d="M0,441L30,400.2C60,359,120,278,180,245C240,212,300,229,360,245C420,261,480,278,540,236.8C600,196,660,98,720,49C780,0,840,0,900,16.3C960,33,1020,65,1080,122.5C1140,180,1200,261,1260,245C1320,229,1380,114,1440,98V490H0V441Z"
              />
            </svg>
          </div>

          <div className="overlay"></div>

          <div className="how-it-works" onClick={() => navigate("/HowItWorks")}>
            How It Works?
          </div>

          <div className="content">
            <h2>Your Points:</h2>
            <h2>{points }</h2>

            <Button
              onClick={() => navigate("/redeemvoucher", { state: { points } })}
            >
              Redeem
            </Button>
            <br />
            <Button
              onClick={() =>
                document
                  .getElementById("vouchers")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              View Your Vouchers
            </Button>
          </div>
        </div>

        <div id="vouchers">
          <Vouchers
            vouchers={loyaltyProgram?.discountCodes}
            parsePercentageFromCode={parsePercentageFromCode}
          />
        </div>
      </Layout>
    </div>
  );
}

export default LoyaltyProgram;
