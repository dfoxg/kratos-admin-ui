import { Button, Title1, Title2 } from "@fluentui/react-components";
import { IdentityApi, Identity, IdentityCredentials } from "@ory/kratos-client";
import React, { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getKratosConfig } from "../../../config";
import { ListSessions } from "../../../components/sessions/list-sessions";
import "./view.scss";

interface ViewIdentityState {
  identity?: Identity;
}

export const ViewIdentitySite: React.FC = () => {
  const [identity, setIdentity] = React.useState<Identity | undefined>(
    undefined,
  );
  const params = useParams();
  const navigate = useNavigate();

  React.useEffect(() => {
    getKratosConfig().then((config) => {
      const api = new IdentityApi(config.adminConfig);
      api
        .getIdentity({
          id: params.id as string,
        })
        .then((data) => {
          setIdentity(data.data);
        })
        .catch((err) => {
          setIdentity(err.response.data);
        });
    });
  }, [params.id]);

  function isObject(object: any) {
    return typeof object === "object" && object !== null;
  }

  function getStringValue(any: any): string {
    if (typeof any === "boolean") {
      return any.toString();
    }
    return any;
  }

  function getUnorderdList(object: any): ReactNode {
    return (
      <ul>
        {Object.keys(object).map((element, index) => {
          return (
            <div key={index}>
              {!isObject(object[element]) || (
                <li>
                  <b>{element}</b>:{getUnorderdList(object[element])}
                </li>
              )}
              {isObject(object[element]) || (
                <li>
                  <b>{element}</b>: {getStringValue(object[element])}
                </li>
              )}
            </div>
          );
        })}
      </ul>
    );
  }

  function navigateToEdit() {
    navigate("/identities/" + identity?.id + "/edit");
  }

  function renderSideElement(name: string, value?: string): React.ReactNode {
    return (
      <div>
        <p>
          <b>{name}</b>
          <br />
          {value}
        </p>
      </div>
    );
  }

  function mapListElement(list?: any[]): string {
    if (list) {
      return list.map((e) => e.value).join(", ");
    }
    return "";
  }

  function mapCredentials(credentials?: {
    [key: string]: IdentityCredentials;
  }): string {
    if (credentials) {
      return Object.entries(credentials)
        .map((e) => {
          return e[0] + " (" + e[1].identifiers + ")";
        })
        .join(", ");
    }
    return "";
  }

  return (
    <div className="container">
      <Title1 as={"h1"}>View Identity</Title1>
      {!identity || (
        <div style={{ marginTop: 10 }}>
          <div className="splitview">
            <div className="plainJSON">{getUnorderdList(identity)}</div>
            <div>
              {renderSideElement("id", identity.id)}
              {renderSideElement("traits", JSON.stringify(identity.traits))}
              {renderSideElement(
                "metadata_public",
                JSON.stringify(identity.metadata_public),
              )}
              {renderSideElement(
                "metadata_admin",
                JSON.stringify(identity.metadata_admin),
              )}
              {renderSideElement("state", identity.state)}
              {renderSideElement("created_at", identity.created_at)}
              {renderSideElement("updated_at", identity.updated_at)}
              {renderSideElement(
                "verifiable_addresses",
                mapListElement(identity.verifiable_addresses),
              )}
              {renderSideElement(
                "recovery_addresses",
                mapListElement(identity.recovery_addresses),
              )}
              {renderSideElement(
                "credentials",
                mapCredentials(identity.credentials),
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
            <Button
              appearance="primary"
              onClick={() => navigateToEdit()}>
              Edit
            </Button>
            <Button onClick={() => navigate("/identities")}>Close</Button>
          </div>
          <div>
            <Title2 as="h2">Sessions</Title2>
            <ListSessions identity_id={identity.id}></ListSessions>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewIdentitySite;
