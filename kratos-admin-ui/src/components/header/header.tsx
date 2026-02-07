import React from "react";
import { useNavigate } from "react-router-dom";
import "./header.scss";

const HeaderComponent: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header>
      <span
        onClick={() => {
          navigate("/identities");
        }}>
        kratos-admin-ui
      </span>
    </header>
  );
};

export default HeaderComponent;
