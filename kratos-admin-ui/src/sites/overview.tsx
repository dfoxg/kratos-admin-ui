import { MetadataApi, V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { KRATOS_ADMIN_CONFIG, KRATOS_PUBLIC_CONFIG } from "../config";

interface OverviewState {
    version?: string;
    ready?: string;
}

class OverviewSite extends React.Component<any, OverviewState> {

    state: Readonly<OverviewState> = {}

    private adminAPI = new V0alpha2Api(KRATOS_ADMIN_CONFIG);
    private metadataAPI = new MetadataApi(KRATOS_ADMIN_CONFIG);
    private publicAPI = new V0alpha2Api(KRATOS_PUBLIC_CONFIG);

    componentDidMount() {
        this.fetchData().then(() => { })
    }

    private async fetchData() {
        try {
            const version = await this.metadataAPI.getVersion();
            const ready = await this.metadataAPI.isReady();
            this.setState({
                version: version.data.version,
                ready: ready.data.status
            })
        } catch (error) {
            this.setState({
                version: "error",
                ready: "error"
            })
        }
    }

    render(): React.ReactNode {
        return (<div className="container">
            <h1>Kratos Admin-UI</h1>
            <div>
                <table className="table table-hover">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Public URI</td>
                            <td>{KRATOS_PUBLIC_CONFIG.basePath}</td>
                        </tr>
                        <tr>
                            <td>Admin URI</td>
                            <td>{KRATOS_ADMIN_CONFIG.basePath}</td>
                        </tr>
                        <tr>
                            <td>Kratos Ready</td>
                            <td>{this.state.ready}</td>
                        </tr>
                        <tr>
                            <td>Kratos Version</td>
                            <td>{this.state.version}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>)
    }
}

export default withRouter(OverviewSite);