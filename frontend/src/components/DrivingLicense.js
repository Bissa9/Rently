import { Form, Row, Col } from "antd";
import React from "react";

function DrivingLicense() {
  return (
    <div>
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
              rules={[{ required: true, message: "Please enter Issued Day!" }]}
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
    </div>
  );
}

export default DrivingLicense;
