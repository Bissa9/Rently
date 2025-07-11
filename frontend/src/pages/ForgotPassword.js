import React, { useState } from "react";
import {  Progress } from "antd";
import { useNavigate, Link } from "react-router-dom";

import StepOne from "../components/Forgot Password/StepOne";
import StepTwo from "../components/Forgot Password/StepTwo";
import StepThree from "../components/Forgot Password/StepThree";
import "../resources/Signup.css";

function ForgotPassword() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleStepOneNext = (emailFromStepOne) => {
    setEmail(emailFromStepOne);
    setCurrentStep(2);
  };

  const handleStepTwoNext = () => {
    setCurrentStep(3);
  };

  const handleFinish = () => {
    navigate("/Login");
  };

  const getProgressPercent = () => (currentStep / 3) * 100;

  return (
    <div className="page-container">
      <div className="image-container">
        <img src="/images/RentlyLogo.png" alt="Logo" className="logo" />
      </div>

      <div className="signup-container">
        <Progress
          className="progress-bar"
          percent={getProgressPercent()}
          status={getProgressPercent() === 100 ? "success" : "active"}
          showInfo={false}
          strokeColor={{
            "0%": "#FF6B35",
            "100%": "#FF6B35",
          }}
        />

        {currentStep === 1 && <StepOne onNext={handleStepOneNext} />}
        {currentStep === 2 && (
          <StepTwo email={email} onNext={handleStepTwoNext} onBack={() => setCurrentStep(1)} />
        )}
        {currentStep === 3 && (
          <StepThree email={email} onFinish={handleFinish} onBack={() => setCurrentStep(2)} />
        )}
      </div>

      <div className="registered">
        <p>
          Remembered your password?{" "}
          <Link to="/Login" className="registered-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
