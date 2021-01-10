import { Fabric } from "@fluentui/react";
import React from "react";
import { withRouter } from "react-router-dom";

export class ViewIdentitySite extends React.Component<any, any> {
    render() {
        return (
            <Fabric>
                <div className="container">
                    <h1>View Identity</h1>
                </div>
            </Fabric>
        )
    }
}

export default withRouter(ViewIdentitySite);