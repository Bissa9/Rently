import React ,{useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { LeftOutlined } from "@ant-design/icons";
import "../resources/backbutton.css";

const BackButton = ({ color = "black" }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const onPopState = () => {
      navigate(-1);
    };
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [navigate]);
  return (
    <div className="back-button-black" onClick={() => navigate(-1)}>
      <LeftOutlined style={{ color }} />
    </div>
  );
};

export default BackButton;
