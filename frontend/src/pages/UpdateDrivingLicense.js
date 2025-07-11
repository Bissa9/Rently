import React, { useState, useContext } from 'react';
import { Form, Button, notification } from 'antd';
import DrivingLicense from '../components/DrivingLicense';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from "../api/userAPI";
import { UserContext } from "../contexts/UserContext";

function UpdateDrivingLicense() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { user, updateProfile } = useContext(UserContext);
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  try {
    const values = await form.validateFields();
    setLoading(true);

    const issuedDate = new Date(
      values.issuedYear,
      values.issuedMonth - 1,
      values.issuedDay
    ).toISOString();

    const expiryDate = new Date(
      values.endYear,
      values.endMonth - 1,
      values.endDay
    ).toISOString();

    // Only sending the dates—`number` is omitted so it stays unchanged on the server
    const licenseData = {
      drivingLicense: {
        issuedDate,
        expiryDate
      }
    };

    // First send to server…
    await updateUserProfile(licenseData);
    // …then update local context
    updateProfile(licenseData);

    api.success({
      message: 'Success',
      description: 'Driving license updated successfully!',
      placement: "top"
    });

    setTimeout(() => navigate('/profile'), 2000);

  } catch (error) {
    api.error({
      message: 'Error',
      description: error.response?.data?.message || 'Failed to update license',
      placement: "top"
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <div className='page-container'>
      {contextHolder}
      <div className='image-container'>
        <img src='/images/RentlyLogo.png' alt='Rently Logo' className='logo' />
      </div>
      <div className='update-container'>
        <h1 className='update-title'>Update Driving License</h1>
        <Form form={form} onFinish={handleSubmit} layout='vertical'>
          <DrivingLicense />
          <div className='update-profile-button'>
            <Button 
              htmlType="submit"
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default UpdateDrivingLicense;