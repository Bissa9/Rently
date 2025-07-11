import React from 'react'
import "../resources/explore.css";
const Button = ({ text, onClick, color ,border ,textColor }) => {
    return <button onClick={onClick} className="btn" style={{backgroundColor: color , border: border ,color: textColor}}>{text}</button>;
  
}

export default Button
