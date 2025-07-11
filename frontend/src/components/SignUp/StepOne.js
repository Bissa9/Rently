import React, { useState } from "react";
import { Form } from "antd";
import PasswordInput from "../Auth/PasswordInput";
import "../../resources/Signup.css";

function StepOne({ onNext }) {
  const [form] = Form.useForm();
  const [hideButtons, setHideButtons] = useState(false);

  const handleSubmit = async (values) => {
    const phoneNum = values.phone.trim().replace(/\s|-/g, "");

    let formattedPhone = phoneNum;

    if (phoneNum.startsWith("01") && phoneNum.length === 11) {
      formattedPhone = "+2" + phoneNum;
    }

    values.phone = formattedPhone;
    onNext(values);
  };

  const handleFocus = () => setHideButtons(true);
  const handleBlur = () => setHideButtons(false);

  return (
    <div>
      <h1 className="signup-title">Sign Up</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="form"
      >
        {/* 👇 Custom row that stays inline even on mobile */}
        <div className="inline-inputs">
          <Form.Item
            label="First Name"
            name="firstName"
            rules={[
              { required: true, message: "Please enter your first name" },
              {
                pattern: /^[A-Za-z]+$/,
                message: "First name must contain only letters",
              },
            ]}
            className="half-width-item"
          >
            <input
              type="text"
              className="input-field"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
              }}
            />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, message: "Please enter your last name!" },
              {
                pattern: /^[A-Za-z]+$/,
                message: "Last name must contain only letters",
              },
            ]}
            className="half-width-item"
          >
            <input
              type="text"
              className="input-field"
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-Z]/g, "");
              }}
            />
          </Form.Item>
        </div>

        {/* 📧 Email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Please enter your email!" }]}
        >
          <input type="email" className="input-field" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone"
          rules={[
            { required: true, message: "Please enter your phone number!" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                const cleaned = value.trim().replace(/\s|-/g, "");
                const validPrefixes = ["010", "011", "012", "015"];

                // Format: +201XXXXXXXXX → 13 digits total
                if (cleaned.startsWith("+20")) {
                  const localPart = cleaned.slice(3); // remove +20
                  if (
                    localPart.length === 10 &&
                    validPrefixes.includes("0" + localPart[0] + localPart[1])
                  ) {
                    return Promise.resolve();
                  }
                }

                // Format: 01XXXXXXXXX → 11 digits total
                if (cleaned.startsWith("01") && cleaned.length === 11) {
                  const prefix = cleaned.slice(0, 3);
                  if (validPrefixes.includes(prefix)) {
                    return Promise.resolve();
                  }
                }

                return Promise.reject(
                  new Error("Invalid Egyptian phone number format.")
                );
              },
            },
          ]}
        >
          <input
            type="tel"
            inputMode="numeric"
            pattern="[0-9+]*"
            onInput={(e) => {
              e.target.value = e.target.value.replace(/[^\d+]/g, "");
            }}
            className="input-field"
          />
        </Form.Item>

        {/* 🔒 Password + Confirm */}
        <PasswordInput form={form} onFocus={handleFocus} onBlur={handleBlur} />

        {!hideButtons && (
          <div className="btns">
            <button className="btn-primary" type="submit">
              Next
            </button>
          </div>
        )}
      </Form>
    </div>
  );
}

export default StepOne;
