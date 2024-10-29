import { Button, Title1, Title2 } from "@fluentui/react-components";
import { IdentityApi, Identity, IdentityCredentials } from "@ory/kratos-client";
import React, { ReactNode } from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../../config";
import { ListSessions } from "../../../components/sessions/list-sessions";
import "./view.scss";

interface ViewIdentityState {
  identity?: Identity;
}

export class ViewIdentitySite extends React.Component<any, ViewIdentityState> {
  state: ViewIdentityState = {};

  componentDidMount() {
    getKratosConfig().then((config) => {
      const api = new IdentityApi(config.adminConfig);
      api
        .getIdentity({
          id: this.props.match.params.id,
        })
        .then((data) => {
          this.setState({
            identity: data.data,
          });
        })
        .catch((err) => {
          this.setState({
            identity: err.response.data,
          });
        });
    });
  }

  isObject(object: any) {
    return typeof object === "object" && object !== null;
  }

  getStringValue(any: any): string {
    if (typeof any === "boolean") {
      return any.toString();
    }
    return any;
  }

  getUnorderdList(object: any): ReactNode {
    return (
      <ul>
        {Object.keys(object).map((element, index) => {
          return (
            <div key={index}>
              {!this.isObject(object[element]) || (
                <li>
                  <b>{element}</b>:{this.getUnorderdList(object[element])}
                </li>
              )}
              {this.isObject(object[element]) || (
                <li>
                  <b>{element}</b>: {this.getStringValue(object[element])}
                </li>
              )}
            </div>
          );
        })}
      </ul>
    );
  }

  navigateToEdit() {
    this.props.history.push("/identities/" + this.state.identity?.id + "/edit");
  }

  renderSideElement(name: string, value?: string): React.ReactNode {
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

  mapListElement(list?: any[]): string {
    if (list) {
      return list.map((e) => e.value).join(", ");
    }
    return "";
  }

  mapCredentials(credentials?: { [key: string]: IdentityCredentials }): string {
    if (credentials) {
      return Object.entries(credentials)
        .map((e) => {
          return e[0] + " (" + e[1].identifiers + ")";
        })
        .join(", ");
    }
    return "";
  }

  render() {
    return (
      <div className="container">
        <Title1 as={"h1"}>View Identity</Title1>
        {!this.state.identity || (
          <div style={{ marginTop: 10 }}>
            <div className="splitview">
              <div className="plainJSON">
                {this.getUnorderdList(this.state.identity)}
              </div>
              <div>
                {this.renderSideElement("id", this.state.identity.id)}
                {this.renderSideElement(
                  "traits",
                  JSON.stringify(this.state.identity.traits),
                )}
                {this.renderSideElement(
                  "metadata_public",
                  JSON.stringify(this.state.identity.metadata_public),
                )}
                {this.renderSideElement(
                  "metadata_admin",
                  JSON.stringify(this.state.identity.metadata_admin),
                )}
                {this.renderSideElement("state", this.state.identity.state)}
                {this.renderSideElement(
                  "created_at",
                  this.state.identity.created_at,
                )}
                {this.renderSideElement(
                  "updated_at",
                  this.state.identity.updated_at,
                )}
                {this.renderSideElement(
                  "verifiable_addresses",
                  this.mapListElement(this.state.identity.verifiable_addresses),
                )}
                {this.renderSideElement(
                  "recovery_addresses",
                  this.mapListElement(this.state.identity.recovery_addresses),
                )}
                {this.renderSideElement(
                  "credentials",
                  this.mapCredentials(this.state.identity.credentials),
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
              <Button
                appearance="primary"
                onClick={() => this.navigateToEdit()}>
                Edit
              </Button>
              <Button onClick={() => this.props.history.push("/identities")}>
                Close
              </Button>
            </div>
            <div>
              <Title2 as="h2">Sessions</Title2>
              <ListSessions identity_id={this.state.identity.id}></ListSessions>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ViewIdentitySite);
