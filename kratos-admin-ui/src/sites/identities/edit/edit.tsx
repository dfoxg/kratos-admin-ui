import { Title1, Title2 } from "@fluentui/react-components";
import { Identity, IdentityApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { ListSessions } from "../../../components/sessions/list-sessions";
import { getKratosConfig } from "../../../config";
import { EditTraits } from "../../../components/traits/edit-traits";

interface EditIdentityState {
  identity?: Identity;
}

class EditIdentitySite extends React.Component<any, EditIdentityState> {
  state: EditIdentityState = {};

  componentDidMount() {
    this.mapEntity(this.props.match.params.id).then(() => {});
  }

  async mapEntity(id: any): Promise<void> {
    const config = await getKratosConfig();
    const adminAPI = new IdentityApi(config.adminConfig);
    const entity = await adminAPI.getIdentity({
      id: id,
    });

    this.setState({
      identity: entity.data,
    });
  }

  render() {
    return (
      <div className="container">
        <Title1 as={"h1"}>Edit Identity</Title1>
        {!this.state.identity || (
          <div style={{ marginTop: 10 }}>
            <div>
              <EditTraits
                modi="edit"
                identity={this.state.identity}></EditTraits>
            </div>
            <div>
              <Title2>Sessions</Title2>
              <ListSessions identity_id={this.state.identity.id}></ListSessions>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(EditIdentitySite);
