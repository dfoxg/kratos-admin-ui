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

export const OverviewSite: React.FC = () => {
  const [version, setVersion] = React.useState<string | undefined>(undefined);
  const [ready, setReady] = React.useState<string | undefined>(undefined);
  const [config, setConfig] = React.useState<KratosAdminConfig | undefined>(undefined);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const cfg: KratosAdminConfig = await getKratosAdminConfig();
        setVersion("loading...");
        setReady("loading...");
        setConfig(cfg);
        const kratosConfig: KratosConfig = await getKratosConfig();
        const copy = kratosConfig.adminConfig;
        copy.basePath = copy.basePath + "/admin";
        const metadataAPI = new MetadataApi(copy);
        const versionRes = await metadataAPI.getVersion();
        const readyRes = await metadataAPI.isReady();
        setVersion(versionRes.data.version);
        setReady(readyRes.data.status);
        setConfig(cfg);
      } catch (error) {
        setVersion("error");
        setReady("error");
        MessageService.Instance.dispatchMessage({
          message: {
            intent: "error",
            title: "failed to get kratos configuration",
          },
          removeAfterSeconds: 4000,
        });
      }
    }

    fetchData();
  }, []);

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
                {config?.reverseProxy ? "Yes" : "No"}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Public URI</TableCell>
              <TableCell className="codeStyle">{config?.kratosPublicURL}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Admin URI</TableCell>
              <TableCell className="codeStyle">{config?.kratosAdminURL}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Admin-UI Version</TableCell>
              <TableCell className="codeStyle">{config?.version} </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Kratos Ready</TableCell>
              <TableCell style={{ color: ready === "ok" ? "green" : "red" }} className="codeStyle">
                {ready}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Kratos Version</TableCell>
              <TableCell
                style={{
                  color: config?.supportedVersion === version ? "green" : "red",
                }}
                className="codeStyle">
                {version}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OverviewSite;
