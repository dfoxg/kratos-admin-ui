import { Title1 } from "@fluentui/react-components";
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components/unstable";
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
            this.setState({
                version: "loading...",
                ready: "loading...",
                config: config
            })
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHeaderCell>Key</TableHeaderCell>
                            <TableHeaderCell>Value</TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell>Public URI</TableCell>
                            <TableCell className="codeStyle">{this.state.config?.kratosPublicURL}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Admin URI</TableCell>
                            <TableCell className="codeStyle">{this.state.config?.kratosAdminURL}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Admin-UI Version</TableCell>
                            <TableCell className="codeStyle">{this.state.config?.version} </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Kratos Ready</TableCell>
                            <TableCell style={{ color: this.state.ready === "ok" ? 'green' : "red" }} className="codeStyle">{this.state.ready}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Kratos Version</TableCell>
                            <TableCell style={{ color: this.state.config?.supportedVersion === this.state.version ? 'green' : "red" }} className="codeStyle">{this.state.version}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </div>)
    }
}

export default withRouter(OverviewSite);