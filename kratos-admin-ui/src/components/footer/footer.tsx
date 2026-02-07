import React from "react";
import { Link } from "react-router-dom";
import "./footer.scss";

const FooterComponent: React.FC = () => {
  return (
    <footer>
      <div
        style={{
          textAlign: "center",
        }}>
        <p>
          Powered by Open Source.&nbsp;
          <a
            href="https://github.com/dfoxg/kratos-admin-ui"
            target="_blank"
            rel="noreferrer">
            Support the Project on Github
          </a>
          .&nbsp;
          <Link to={'/overview'}>Environment overview</Link>.
        </p>
      </div>
    </footer>
  );
};

export default FooterComponent;
