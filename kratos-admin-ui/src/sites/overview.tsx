import { Title1 } from "@fluentui/react-components";
import { MetadataApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { KratosAdminConfig, getKratosAdminConfig, getKratosConfig, KratosConfig } from "../config";

interface OverviewState {
    version?: string;
    ready?: string;
    config?: KratosAdminConfig;
}

class OverviewSite extends React.Component<any, OverviewState> {

    state: Readonly<OverviewState> = {}


    componentDidMount() {
        this.fetchData().then(() => { })
    }

    private async fetchData() {
        try {
            const config: KratosAdminConfig = await getKratosAdminConfig()
            const kratosConfig: KratosConfig = await getKratosConfig()
            const metadataAPI = new MetadataApi(kratosConfig.adminConfig);
            const version = await metadataAPI.getVersion();
            const ready = await metadataAPI.isReady();
            this.setState({
                version: version.data.version,
                ready: ready.data.status,
                config: config
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
            <Title1 as={"h1"}>Environment Overview</Title1>
            <div>
                <table className="table table-hover table-striped">
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Value</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Public URI</td>
                            <td>{this.state.config?.kratosPublicURL}</td>
                        </tr>
                        <tr>
                            <td>Admin URI</td>
                            <td>{this.state.config?.kratosAdminURL}</td>
                        </tr>
                        <tr>
                            <td>Kratos Ready</td>
                            <td style={{ color: this.state.ready === "ok" ? 'green' : "red" }}>{this.state.ready}</td>
                        </tr>
                        <tr>
                            <td>Kratos Version</td>
                            <td style={{ color: this.state.config?.supportedVersion === this.state.version ? 'green' : "red" }}>{this.state.version}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>)
    }
}

export default withRouter(OverviewSite);