import React, { useState, useEffect, useContext } from "react";
import { Alert, Form, message } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { login, resendVerification } from "../api/userAPI";
import { ToastContainer, toast } from "react-toastify";
import { UserContext } from "../contexts/UserContext";
import { jwtDecode } from "jwt-decode";
import { useTimer } from "react-timer-hook";
import "react-toastify/dist/ReactToastify.css";
import "../resources/login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const verified = params.get("verified");

  const { setUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [alertMessage, setAlertMessage] = useState(null);
  const [alertType, setAlertType] = useState("info");

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + 0);

  const { seconds, isRunning, restart } = useTimer({
    expiryTimestamp: expiryTime,
    autoStart: false,
    onExpire: () => {},
  });

  useEffect(() => {
    if (verified === "success") {
      toast.success("Email verified successfully!", {
        position: "top-center",
      });
    }
    if (verified === "fail") {
      toast.error("Email verification failed or link expired.", {
        position: "top-center",
      });
    }
  }, [verified]);

  const handleResendVerification = async (email) => {
    if (!email) {
      setAlertType("error");
      setAlertMessage("Please enter a valid email first.");
      return;
    }

    const res = await resendVerification(email);

    if (res.success) {
      setAlertType("success");
      setAlertMessage("Verification email resent successfully!");
      const time = new Date();
      time.setSeconds(time.getSeconds() + 60);
      restart(time);
    } else {
      setAlertType("error");
      setAlertMessage(res.message || "Failed to resend verification email.");
    }
  };

  const onFinish = async (values) => {
    try {
      const response = await login(values.email, values.password);

      if (response.success) {
        message.success(response.message);
        setAlertMessage(null);
        localStorage.removeItem("pendingEmail");
        localStorage.setItem("token", response.data);

        const decodedUser = jwtDecode(response.data);
        setUser(decodedUser);

        navigate("/");
      } else {
        if (response.message === "Invalid email or password") {
          setAlertType("error");
          setAlertMessage("Invalid email or password.");
        } else if (response.message === "Email not verified") {
          setPendingEmail(values.email);
          setAlertType("warning");
          setAlertMessage("Your email is not verified.");
        } else {
          setAlertType("error");
          setAlertMessage(response.message || "Login failed.");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="image-container">
        <img src="/images/RentlyLogo.png" alt="Description" className="logo" />
      </div>

      {alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          action={
            alertType === "warning" && pendingEmail ? (
              <button
                className="resend-verification-email-btn"
                onClick={() => handleResendVerification(pendingEmail)}
                disabled={isRunning}
              >
                {isRunning
                  ? `Resend in ${seconds}s`
                  : "Resend Verification Email"}
              </button>
            ) : null
          }
          style={{
            marginBottom: "25px",
            marginTop: "-30px",
          }}
          onClose={() => setAlertMessage(null)}
        />
      )}

      <div className="login-container">
        <h1 className="login-title">Login</h1>

        <Form layout="vertical" onFinish={onFinish} className="form">
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Please enter your email!" }]}
          >
            <input type="email" className="input-field" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Please enter your password!" }]}
          >
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="input-field"
              />
              <span
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
                style={{
                  cursor: "pointer",
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </span>
            </div>
          </Form.Item>

          <div className="forgot-password">
            <Link to="/forgotpass">Forgot password?</Link>
          </div>

          <div className="btns">
            <button className="btn-primary" type="submit">
              Login
              <img
                src="/images/loginiconn.png"
                alt="loginicon"
                className="login-icon"
              />
            </button>
          </div>
        </Form>
      </div>

      <ToastContainer />

      <div className="register">
        <p>
          Not registered yet?
          <Link to="/Signup" className="register-link">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
