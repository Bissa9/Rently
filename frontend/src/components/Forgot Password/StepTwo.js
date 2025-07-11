import React, { useRef, useState } from "react";
import { Form } from "antd";
import { verifyResetCode } from "../../api/userAPI";
import { toast , ToastContainer } from "react-toastify";
import "../../resources/Signup.css";

function StepTwo({ onNext, email }) {
  const [form] = Form.useForm();
  const inputsRef = useRef([]);
  const [loading, setLoading] = useState(false);

const handleSubmit = async (values) => {
  const resetCode = Object.values(values).join("");
  try {
    setLoading(true);
    const response = await verifyResetCode({ email, resetCode });
    if (response.success) {
      toast.success("Verification successful!");
      onNext();
    } else {
      toast.error(response.message || "Verification failed");
    }
  } catch (err) {
    toast.error(err.message || "Something went wrong");
  } finally {
    setLoading(false);
  }
};


  const handleInput = (e, index) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, "");
    if (e.target.value.length === 1 && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <div>
      <ToastContainer/>
      <h1 className="signup-title">Enter Verification Code</h1>

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div className="h-form">
          {[1, 2, 3, 4, 5, 6].map((item, index) => (
            <Form.Item
              key={item}
              name={`digit${item}`}
              rules={[
                { required: true, message: "Enter this digit" },
                {
                  pattern: /^[0-9]$/,
                  message: "Must be a single digit",
                },
              ]}
            >
              <input
                type="text"
                maxLength={1}
                className="verify-input-field"
                ref={(el) => (inputsRef.current[index] = el)}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            </Form.Item>
          ))}
        </div>
        <div className="btns">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Next"}
          </button>
        </div>
      </Form>
    </div>
  );
}

export default StepTwo;
