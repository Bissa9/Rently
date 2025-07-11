import React, { useContext } from "react";
import { Button, Form, Input, Col, Row, Avatar, notification } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { updateUserProfile } from "../api/userAPI";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

function UpdateProfile() {
  const [form] = Form.useForm();
  const { user, updateProfile } = useContext(UserContext);
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();

  const handleSubmit = async (values) => {
    try {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phoneNumber,
      };

      updateProfile(payload);

      const response = await updateUserProfile(payload);

      api.success({
        message: "Success",
        description: response.message || "Profile updated successfully!",
        placement: "top",
        duration: 2, 
      });

      setTimeout(() => navigate("/profile"), 2000);

    } catch (error) {
      api.error({
        message: "Error",
        description: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  return (
    <div className="page-container">
      {contextHolder}
      <div className="image-container">
        <img src="/images/RentlyLogo.png" alt="Description" className="logo" />
      </div>
      <div className="update-container">
        <h1 className="update-title" style={{ textAlign: "center"}}>Update Profile</h1>

        <div
          className="avatar-container"
          style={{ textAlign: "center", marginBottom: 24 }}
        >
          <Avatar size={100} icon={<UserOutlined />} />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="profile-form"
        >
          <Row gutter={[16, 16]}>
            <Col lg={12} sm={24}>
              <Form.Item label="First Name" name="firstName">
                <Input />
              </Form.Item>
            </Col>
            <Col lg={12} sm={24}>
              <Form.Item label="Last Name" name="lastName">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Phone Number" name="phoneNumber">
            <Input type="tel" />
          </Form.Item>

          <div className="update-profile-button">
            <Button htmlType="submit">Save Changes</Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default UpdateProfile;
