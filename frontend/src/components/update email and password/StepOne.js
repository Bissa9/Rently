import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import "../../resources/profileUpdate.css";

function StepOne({ onNext }) {
  const [form] = Form.useForm();
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleSubmit = (values) => {
    // values.oldPassword is the password entered
    onNext(values);  // Pass it up to parent
  };

  return (
    <div className="step-one-container">
      <h1 className="update-title">Update Password</h1>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Old Password"
          name="oldPassword"
          rules={[{ required: true, message: "Please enter your old password" }]}
        >
          <Input
            type={showPassword ? "text" : "password"}
            suffix={
              <span
                onClick={togglePasswordVisibility}
                style={{ cursor: "pointer" }}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>

        <Form.Item style={{ textAlign: "right" }}>
          <Button htmlType="submit">
            Next
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default StepOne;
