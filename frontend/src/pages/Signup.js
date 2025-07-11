import React, { useState } from "react";
import { message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { signup } from "../api/userAPI";
import StepOne from "../components/SignUp/StepOne";
import StepTwo from "../components/SignUp/StepTwo";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../resources/Signup.css";

function SignUp() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const navigate = useNavigate();

  const handleNext = (data) => {
    setFormData({ ...formData, ...data });
    setCurrentStep((prev) => prev + 1);
  };

  const handleFinish = async (values) => {
    const issuedDate = new Date(
      values.issuedYear,
      values.issuedMonth - 1,
      values.issuedDay
    );
    const expiryDate = new Date(
      values.endYear,
      values.endMonth - 1,
      values.endDay
    );
    const completeData = {
      ...formData,
      dateOfBirth: values.dateOfBirth,
      address: values.address,
      drivingLicense: {
        number: values.drivingLicense,
        issuedDate: issuedDate,
        expiryDate: expiryDate,
      },
    };
    try {
      const response = await signup(completeData);
      if (response.success) {
        localStorage.setItem("pendingEmail", completeData.email);
        toast.success("Verification link sent to your email!", {
          position: "top-center",
          autoClose: 3000,
          onClose: () => {
            navigate("/login");
          },
        });
      } else {
        if (response.message === "User already exists") {
          toast.error("This user already exists, please log in.", {
            position: "top-center",
            style: {
              width: "auto",
            },
            autoClose: 3000,
          });
        } else if (
          response.message === "This driving license is already in use"
        ) {
          toast.error("This driving license is already registered.", {
            position: "top-center",
            style: {
              width: "auto",
            },
            autoClose: 3000,
          });
        } else {
          toast.error(response.message || "Signup failed.", {
            position: "top-center",
          });
        }
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="image-container">
        <img src="/images/RentlyLogo.png" alt="Description" className="logo" />
      </div>
      <ToastContainer />
      <div className="signup-container">
        {currentStep === 1 && <StepOne onNext={handleNext} />}
        {currentStep === 2 && (
          <StepTwo onBack={() => setCurrentStep(1)} onFinish={handleFinish} />
        )}
      </div>

      <div className="registered">
        <p>
          Already have an account?
          <Link to="/Login" className="registered-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
