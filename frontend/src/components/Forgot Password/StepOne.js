import React, { useState } from "react";
import { Form, Input } from "antd";
import { requestPasswordReset } from "../../api/userAPI"; 
import { toast , ToastContainer } from "react-toastify";

import "../../resources/Signup.css";

function StepOne({ onNext }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

const handleSubmit = async (values) => {
  try {
    setLoading(true);
    const response = await requestPasswordReset(values.email);
    if (response.success) {
      toast.success("Reset code sent to your email.");
      onNext(values.email);
    } else {
      toast.error(response.message || "Failed to send reset code.");
    }
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      (error.response?.status === 404
        ? "No user found with that email."
        : "Something went wrong.");
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};


  return (
    <div>
      <ToastContainer/>
      <h1 className="signup-title">Enter Your Email</h1>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="form"
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "Enter a valid email!" },
          ]}
        >
          <Input className="input-field" />
        </Form.Item>

        <div className="btns">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Sending..." : "Next"}
          </button>
        </div>
      </Form>
    </div>
  );
}

export default StepOne;
