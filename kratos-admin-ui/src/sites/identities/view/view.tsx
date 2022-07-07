import { DefaultButton, PrimaryButton, Stack } from "@fluentui/react";
import { V0alpha2Api, Identity } from "@ory/kratos-client";
import React, { ReactNode } from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../../config";

interface ViewIdentityState {
    identity?: Identity | any
}

export class ViewIdentitySite extends React.Component<any, ViewIdentityState> {

    state: ViewIdentityState = {
    }

    componentDidMount() {
        getKratosConfig().then(config=> {
            const api = new V0alpha2Api(config.adminConfig);
            api.adminGetIdentity(this.props.match.params.id)
                .then(data => {
                    this.setState({
                        identity: data.data
                    });
                }).catch(err => {
                    this.setState({
                        identity: err.response.data
                    })
                });
        })
    }

    isObject(object: any) {
        return typeof object === 'object' && object !== null;
    }

    getUnorderdList(object: any): ReactNode {
        return (
            <ul>
                {
                    Object.keys(object).map((element, index) => {
                        return (
                            <div key={index}>
                                {!this.isObject(object[element]) ||
                                    <li><b>{element}</b>:
                                        {this.getUnorderdList(object[element])}
                                    </li>
                                }
                                {this.isObject(object[element]) ||
                                    <li >
                                        <b>{element}</b>: {object[element]}
                                    </li>
                                }
                            </div>
                        )
                    })
                }
            </ul>
        )
    }

    navigateToEdit() {
        this.props.history.push("/identities/" + this.state.identity?.id + "/edit");
    }

    render() {
        return (
            <div className="container">
                <h1>View Identity</h1>
                {!this.state.identity ||
                    <div>
                        <div>
                            {this.getUnorderdList(this.state.identity)}
                        </div>
                        <Stack horizontal tokens={{ childrenGap: 20 }}>
                            <PrimaryButton onClick={() => this.navigateToEdit()}>Edit</PrimaryButton>
                            <DefaultButton onClick={() => this.props.history.push("/identities")}>Close</DefaultButton>
                        </Stack>
                    </div>}
            </div>
        )
    }
}

export default withRouter(ViewIdentitySite);