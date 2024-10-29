import {
  Title1,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@fluentui/react-components";
import { MetadataApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import {
  KratosAdminConfig,
  getKratosAdminConfig,
  getKratosConfig,
  KratosConfig,
} from "../config";
import { MessageService } from "../components/messages/messagebar";

interface OverviewState {
  version?: string;
  ready?: string;
  config?: KratosAdminConfig;
}

class OverviewSite extends React.Component<any, OverviewState> {
  state: Readonly<OverviewState> = {};

  componentDidMount() {
    this.fetchData().then(() => {});
  }

  private async fetchData() {
    try {
      const config: KratosAdminConfig = await getKratosAdminConfig();
      this.setState({
        version: "loading...",
        ready: "loading...",
        config: config,
      });
      const kratosConfig: KratosConfig = await getKratosConfig();
      const copy = kratosConfig.adminConfig;
      // admin api redirects to /admin/x. The API-Doc is wrong, at least in version 1.0.0
      copy.basePath = copy.basePath + "/admin";
      const metadataAPI = new MetadataApi(copy);
      const version = await metadataAPI.getVersion();
      const ready = await metadataAPI.isReady();
      this.setState({
        version: version.data.version,
        ready: ready.data.status,
        config: config,
      });
    } catch (error) {
      this.setState({
        version: "error",
        ready: "error",
      });
      MessageService.Instance.dispatchMessage({
        message: {
          intent: "error",
          title: "failed to get kratos configuration",
        },
        removeAfterSeconds: 4000,
      });
    }
  }

  render(): React.ReactNode {
    return (
      <div className="container">
        <Title1 as={"h1"}>Environment Overview</Title1>
        <div style={{ marginTop: 10 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Key</TableHeaderCell>
                <TableHeaderCell>Value</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Reverse Proxy</TableCell>
                <TableCell className="codeStyle">
                  {this.state.config?.reverseProxy ? "Yes" : "No"}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Public URI</TableCell>
                <TableCell className="codeStyle">
                  {this.state.config?.kratosPublicURL}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin URI</TableCell>
                <TableCell className="codeStyle">
                  {this.state.config?.kratosAdminURL}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Admin-UI Version</TableCell>
                <TableCell className="codeStyle">
                  {this.state.config?.version}{" "}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kratos Ready</TableCell>
                <TableCell
                  style={{ color: this.state.ready === "ok" ? "green" : "red" }}
                  className="codeStyle">
                  {this.state.ready}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kratos Version</TableCell>
                <TableCell
                  style={{
                    color:
                      this.state.config?.supportedVersion === this.state.version
                        ? "green"
                        : "red",
                  }}
                  className="codeStyle">
                  {this.state.version}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
}

export default withRouter(OverviewSite);
