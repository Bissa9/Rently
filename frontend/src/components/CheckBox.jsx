import React, { useState } from "react";
import "../resources/checkbox.css";
const CheckBox = ({ label, checked, onChange }) => {
  return (
    <div className="checkbox-container">
      <label className="custom-checkbox">
        <input type="checkbox" checked={checked} onChange={onChange}/>
        <span className={`checkmark `}></span>
      </label>
      <span className="checkbox-label">{label}</span>
    </div>
  );
};

export default CheckBox;
