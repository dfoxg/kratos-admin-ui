import React from "react";
import "./header.scss";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header>
      <Link to="/identities">
        <span className="headerText">kratos-admin-ui</span>
      </Link>
    </header>
  );
}
