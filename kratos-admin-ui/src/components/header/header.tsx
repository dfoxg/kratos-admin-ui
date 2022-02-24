import React from "react";
import { withRouter } from "react-router-dom";
import "./header.scss"

class HeaderComponent extends React.Component<any, any> {
    render() {
        return (
            <header>
                <p
                    onClick={() => { this.props.history.push("/identities") }}>
                    Kratos Admin-UI
                </p>
            </header>
        )
    }
}


export default withRouter(HeaderComponent);