import React, { useEffect, useState } from "react";
import { CheckCircleOutlined } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const steps = [0, 1, 2, 3];

const StepProgress = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  // Animate steps one by one
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5001);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: 250 }}>
      <h1 style={{ fontSize: 50 }}>You Are All Set</h1>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 50,
        }}
      >
        {steps.map((_, index) => (
          <React.Fragment key={index}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: currentStep > index ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <CheckCircleOutlined
                sx={{
                  fontSize: 50,
                  color: "white",
                  backgroundColor: "black",
                  borderRadius: "50%",
                  padding: "6px",
                }}
              />
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: currentStep > index ? 50 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 2,
                  backgroundColor: "black",
                  margin: "0 10px",
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      <p style={{ marginTop: 40, fontSize: 18 }}>
        A host will reach out to you shortly to ensure everything is set for
        your experience.
        <br />
        Get ready for something amazing!
      </p>
    </div>
  );
};

export default StepProgress;
