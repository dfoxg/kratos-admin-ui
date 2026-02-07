import { Title1, Title2 } from "@fluentui/react-components";
import { Identity, IdentityApi } from "@ory/kratos-client";
import React from "react";
import { useParams } from "react-router-dom";
import { ListSessions } from "../../../components/sessions/list-sessions";
import { getKratosConfig } from "../../../config";
import { EditTraits } from "../../../components/traits/edit-traits";

interface EditIdentityState {
  identity?: Identity;
}

export const EditIdentitySite: React.FC = () => {
  const [identity, setIdentity] = React.useState<Identity | undefined>(
    undefined,
  );
  const params = useParams();

  React.useEffect(() => {
    mapEntity(params.id).then(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function mapEntity(id: any): Promise<void> {
    const config = await getKratosConfig();
    const adminAPI = new IdentityApi(config.adminConfig);
    const entity = await adminAPI.getIdentity({
      id: id,
    });

    setIdentity(entity.data);
  }

  return (
    <div className="container">
      <Title1 as={"h1"}>Edit Identity</Title1>
      {!identity || (
        <div style={{ marginTop: 10 }}>
          <div>
            <EditTraits
              modi="edit"
              identity={identity}></EditTraits>
          </div>
          <div>
            <Title2>Sessions</Title2>
            <ListSessions identity_id={identity.id}></ListSessions>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditIdentitySite;
