import React, { useState } from 'react';
import { Form, Progress } from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons';

const PasswordInput = ({
  form,
  name = 'password',
  label = 'Password',
  required = false,
  onFocus,
  onBlur,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false, // ✅ Special character check
  });

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setCriteria({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /\d/.test(value),
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value), // ✅ Regex for special characters
    });
    form?.setFieldsValue({ [name]: value });
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    form?.setFieldsValue({ confirmPassword: value });
  };

  const getProgressPercent = () =>
    (Object.values(criteria).filter(Boolean).length / 5) * 100;

  const renderCriteria = (text, condition) => (
    <p style={{ color: condition ? 'green' : 'red'  , margin: '4px 0',              // Reduce top/bottom spacing
      fontSize: '13px',             // Optional: make text a bit smaller
      lineHeight: '1.2', 
                 // Reduce line spacing
   }}>
      {condition ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {text}
    </p>
  );

  const renderPasswordInput = (value, onChange, show, setShow, handleFocusBlur = false) => (
    <div className="password-input-wrapper" style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className="input-field"
        value={value}
        onChange={onChange}
        {...(handleFocusBlur && {
          onFocus: (e) => {
            setShowValidation(true);
            if (onFocus) onFocus(e);
          },
          onBlur: (e) => {
            setShowValidation(false);
            if (onBlur) onBlur(e);
          },
        })}
      />
      <span
        onClick={() => setShow(!show)}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
        }}
      >
        {show ? <EyeInvisibleOutlined /> : <EyeOutlined />}
      </span>
    </div>
  );

  return (
    <>
      {/* ✅ Main Password Field */}
      <Form.Item
        label={label}
        name={name}
        rules={[
          { required: true, message: 'Please enter your password!' },
          {
            pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
            message:
              'Password must be at least 8 characters long and include uppercase, lowercase, number, and a special character.',
          },
        ]}
      >
        <>
          {renderPasswordInput(password, handlePasswordChange, showPassword, setShowPassword, true)}

          {showValidation && (
            <>
              <Progress
                className="progress-bar"
                percent={getProgressPercent()}
                status={getProgressPercent() === 100 ? 'success' : 'active'}
                showInfo={false}
                strokeColor={{ '0%': '#ff4d4f', '100%': '#52c41a' }}
              />
              <div className="password-criteria">
                {renderCriteria('At least 8 characters', criteria.length)}
                {renderCriteria('At least one uppercase letter', criteria.uppercase)}
                {renderCriteria('At least one lowercase letter', criteria.lowercase)}
                {renderCriteria('At least one number', criteria.number)}
                {renderCriteria('At least one special character', criteria.specialChar)} {/* ✅ New Criteria */}
              </div>
            </>
          )}
        </>
      </Form.Item>

      {/* 🔒 Confirm Password Field */}
      <Form.Item
        label="Confirm Password"
        name="confirmPassword"
        dependencies={[name]}
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue(name) === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords do not match!'));
            },
          }),
        ]}
      >
        {renderPasswordInput(
          confirmPassword,
          handleConfirmPasswordChange,
          showConfirmPassword,
          setShowConfirmPassword
        )}
      </Form.Item>
    </>
  );
};

export default PasswordInput;
