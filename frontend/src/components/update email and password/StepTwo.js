// 📂 components/password/StepTwo.js
import React from "react";
import { Form, Button } from "antd";
import PasswordInput from "../Auth/PasswordInput";
import "../../resources/profileUpdate.css";

function StepTwo({ onBack, onFinish }) {
  const [form] = Form.useForm();

  /** called when user clicks Submit and all validations pass */
  const handleSubmit = ({ password }) => {
    // we only need to return the new password;
    // Step 1 already provided the old password to the parent component
    onFinish({ newPassword: password });
  };

  return (
    <div>
      <h1 className="update-title">Enter Your New Password</h1>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <PasswordInput form={form} name="password" label="New Password" />

        <Form.Item>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // Back hard-left, Submit hard-right
              width: "100%",
            }}
          >
            <Button onClick={onBack}>Back</Button>

            <Button htmlType="submit">Submit</Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
}

export default StepTwo;
