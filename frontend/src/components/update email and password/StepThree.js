import React from "react";
import { Form, Input, Button } from "antd";
import PasswordInput from "../Auth/PasswordInput"; // Using your existing PasswordInput component

function StepThree({ onFinish, onBack, formData }) {
  const [form] = Form.useForm();
  const updateType = formData.updateType; // Check if we're updating email or password

  const handleSubmit = (values) => {
    onFinish(values);
  };

  return (
    <div className="step-container">
      <h1 className="update-title">
        {updateType === "email" ? "Enter Your New Email" : "Enter Your New Password"}
      </h1>

      <Form form={form} onFinish={handleSubmit} layout="vertical">
        {/* New Email Field */}
        {updateType === "email" && (
          <Form.Item
          label="New Email"
          name="newEmail"
          rules={[
            { required: true, message: "Please enter your new email!" },
            { type: "email", message: "Please enter a valid email" }
          ]}
        >
          <input type="email" className="input-field" />
        </Form.Item>
        )}

        {/* New Password Field */}
        {updateType === "password" && (
          <PasswordInput form={form} /> // Using your existing PasswordInput component
        )}

        <div className="button-group">
          <Button onClick={onBack} >
            Back
          </Button>
          <Button  htmlType="submit" >
            Submit
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default StepThree;
