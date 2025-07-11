import React from "react";
import { Form, Button, message } from "antd";
import { resetPassword } from "../../api/userAPI";
import { toast, ToastContainer } from "react-toastify";

import PasswordInput from "../Auth/PasswordInput";

const StepThree = ({ onFinish, onBack, email }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      const res = await resetPassword({ email, newPassword: values.password });
      if (res.success) {
        toast.success("Password reset successful!", {
          position: "top-center",
          autoClose: 3000,
          onClose: () => {
            onFinish();
          },
        });
      } else {
        toast.error(res.message || "Password reset failed", {
          position: "top-center",
        });
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong", {
        position: "top-center",
      });
    }
  };

  return (
    <div>
      <ToastContainer />
      <h1 className="signup-title">Create Password</h1>
      <Form
        form={form}
        layout="vertical"
        className="form"
        onFinish={handleSubmit}
      >
        <PasswordInput form={form} name="password" label="Password" />

        <div className="btns">
          <button className="btn-primary" type="primary" htmlType="submit">
            Finish
          </button>
        </div>
      </Form>
    </div>
  );
};

export default StepThree;
