import React from "react";
import { Form, Row, Col } from "antd";

function StepTwo({ onBack, onFinish }) {
  return (
    <div className="">
      <h1 className="signup-title">Sign Up</h1>
      <Form layout="vertical" onFinish={onFinish} className="form">
        <Form.Item
          label="Date of Birth"
          name="dateOfBirth"
          rules={[
            { required: true, message: "Please enter your date of birth!" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                const dob = new Date(value);
                const today = new Date();
                const age = today.getFullYear() - dob.getFullYear();
                const monthDiff = today.getMonth() - dob.getMonth();
                const dayDiff = today.getDate() - dob.getDate();

                const isOldEnough =
                  age > 18 ||
                  (age === 18 &&
                    (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)));

                return isOldEnough
                  ? Promise.resolve()
                  : Promise.reject(
                      new Error(
                        "You must be at least 18 years old to register."
                      )
                    );
              },
            },
          ]}
        >
          <input type="date" className="input-field" />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[
            { required: true, message: "Please enter your address!" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve(); // avoid duplicate message

                const parts = value
                  .split(",")
                  .map((part) => part.trim().toLowerCase());

                if (parts.length < 3) {
                  return Promise.reject("Enter: address, city, Egypt");
                }
                if (!parts.includes("egypt")) {
                  return Promise.reject("Address must be in 'Egypt'");
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <input
            type="text"
            className="input-field"
            placeholder="e.g. 123 Street, Cairo, Egypt"
            onBlur={(e) => {
              const value = e.target.value;
              const capitalized = value
                .split(",")
                .map((part) =>
                  part
                    .trim()
                    .split(" ")
                    .map(
                      (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase()
                    )
                    .join(" ")
                )
                .join(", ");
              e.target.value = capitalized;
            }}
          />
        </Form.Item>

        <Form.Item
          label="License Number"
          name="drivingLicense"
          rules={[
            { required: true, message: "Please enter your national ID!" },
            {
              pattern: /^\d{14}$/,
              message: "License number must be exactly 14 digits.",
            },
          ]}
        >
          <input type="text" className="input-field" maxLength={14} />
        </Form.Item>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item
              label="Issued Day"
              name="issuedDay"
              rules={[{ required: true, message: "Please enter Issued Day!" }]}
            >
              <input
                type="number"
                placeholder="Day"
                className="input-field"
                min="1"
                max="31"
                rules={[
                  { required: true, message: "Please enter Issued Day!" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Issued Month"
              name="issuedMonth"
              rules={[{ required: true, message: "Please enter Issued Month" }]}
            >
              <input
                type="number"
                placeholder="Month"
                className="input-field"
                min="1"
                max="12"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Issued Year"
              name="issuedYear"
              rules={[{ required: true, message: "Please enter Issued Year!" }]}
            >
              <input
                type="number"
                placeholder="Year"
                className="input-field"
                min="1900"
                max="2100"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Form.Item
              label="End Day"
              name="endDay"
              rules={[{ required: true, message: "Please enter End Day!" }]}
            >
              <input
                type="number"
                placeholder="Day"
                className="input-field"
                min="1"
                max="31"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="End Month"
              name="endMonth"
              rules={[{ required: true, message: "Please enter End Month!" }]}
            >
              <input
                type="number"
                placeholder="Month"
                className="input-field"
                min="1"
                max="12"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="End Year"
              name="endYear"
              rules={[{ required: true, message: "Please enter End Year!" }]}
            >
              <input
                type="number"
                placeholder="Year"
                className="input-field"
                min="1900"
                max="2100"
              />
            </Form.Item>
          </Col>
        </Row>

        <div className="btns">
          <button type="primary" className="btn-primary">
            Submit
          </button>
        </div>
      </Form>
    </div>
  );
}

export default StepTwo;
