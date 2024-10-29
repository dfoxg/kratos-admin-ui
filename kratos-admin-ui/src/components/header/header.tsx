import React from "react";
import { withRouter } from "react-router-dom";
import "./header.scss";

class HeaderComponent extends React.Component<any, any> {
  render() {
    return (
      <header>
        <span
          onClick={() => {
            this.props.history.push("/identities");
          }}>
          kratos-admin-ui
        </span>
      </header>
    );
  }
}

export default withRouter(HeaderComponent);
