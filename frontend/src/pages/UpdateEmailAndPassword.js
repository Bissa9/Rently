// 📂 pages/UpdatePassword.jsx
import React, { useState, useContext } from "react";
import { Form, Progress, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import StepOne from "../components/update email and password/StepOne";
import StepTwo from "../components/update email and password/StepTwo";
import { UserContext } from "../contexts/UserContext";
import { checkOldPassword, updatePassword } from "../api/userAPI";

export default function UpdatePassword() {
  const [step, setStep]   = useState(1);
  const [oldPwd, setOld]  = useState("");
  const navigate          = useNavigate();
  const { refreshUserProfile } = useContext(UserContext);   // <- correct name
  const [api, contextHolder]    = notification.useNotification();

  /* ---------- STEP-1 ---------- */
const handleVerify = async ({ oldPassword }) => {
  console.log("handleVerify called with oldPassword:", oldPassword);
  try {
    const token = localStorage.getItem("token");
    const result = await checkOldPassword(oldPassword, token);

    if (result.success) {
      console.log("Old password verified");
      api.success({ message: "Verified", description: "Old password is correct" ,placement: 'top'});
      setOld(oldPassword);
      setStep(2);  // Only move to step 2 on success
    } else {
      api.error({ message: "Error", description: result.message || "Wrong password" ,placement: 'top'});
    }
  } catch (err) {
    console.error("Unexpected error during old password verification:", err);
  }
};

  /* ---------- STEP-2 ---------- */
const handleUpdate = async ({ newPassword }) => {
  try {
    const token   = localStorage.getItem("token");
    const result  = await updatePassword(oldPwd, newPassword, token);

    /* --- failure --- */
    if (!result.success) {
      api.error({
        message: "Error",
        description: result.message || "Failed to update password",
        placement: "top",
      });
      return;               // stay on Step-2, keep the dialog open
    }

    /* --- success --- */
    if (refreshUserProfile) await refreshUserProfile();

    api.success({
      message: "Success",
      description: "Password updated successfully!",
      placement: "top",
      duration: 2,
    });
    setTimeout(() => navigate("/profile"), 2000);

  } catch (err) {
    // network or unexpected error
    api.error({
      message: "Error",
      description: err.message || "Unknown error",
      placement: "top",
    });
  }
};


  return (
    <div className="page-container">
      {contextHolder}

      <div className="image-container">
        <img src="/images/RentlyLogo.png" alt="Rently" className="logo" />
      </div>

      <div className="update-container">
        <Progress percent={(step / 2) * 100} showInfo={false} strokeColor="#FF6B35" />

        {/* use prop name that StepOne expects */}
        {step === 1 && <StepOne onNext={handleVerify} />}

        {step === 2 && (
          <StepTwo
            oldPassword={oldPwd}
            onBack={() => setStep(1)}
            onFinish={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}