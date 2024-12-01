import {
  Button,
  Checkbox,
  Field,
  Select,
  Text,
} from "@fluentui/react-components";
import { Identity, IdentityApi, IdentityStateEnum } from "@ory/kratos-client";
import { useEffect, useState } from "react";
import {
  FieldKind,
  SchemaField,
  SchemaService,
} from "../../service/schema-service";
import { getKratosConfig } from "../../config";
import { useHistory } from "react-router-dom";
import { RenderTraitField } from "./render-field";
import { MessageService } from "../messages/messagebar";

type Modi = "new" | "edit";

interface EditTraitsProps {
  modi: Modi;
  identity?: Identity;
  schema?: any;
  schemaId?: string;
}

interface IdentityTraits {
  [key: string]: any;
}

export interface MetaData {
  [key: string]: any;
}

export interface ValueObject {
  state: IdentityStateEnum;
  traits: IdentityTraits;
  publicMetadata: MetaData;
  adminMetadata: MetaData;
}

export function mapFieldKindToValueKey(fieldKind: FieldKind) {
  switch (fieldKind) {
    case "trait":
      return "traits";
    case "metadata_public":
      return "publicMetadata";
    case "metadata_admin":
      return "adminMetadata";
  }
}

function getButtonName(modi: Modi) {
  if (modi === "edit") {
    return "Save";
  } else {
    return "Create";
  }
}

async function fillTraits(
  identity: Identity,
  schemaFields: SchemaField[],
): Promise<IdentityTraits> {
  const map =
    await SchemaService.getTableDetailListModelFromKratosIdentity(identity);
  const traits: IdentityTraits = {};

  for (const [key, value] of Object.entries(map.traits)) {
    if (key !== "key") {
      schemaFields.forEach((f) => {
        if (f.name === key && f.fieldKind === "trait") {
          if (f.parentName) {
            if (!traits[f.parentName]) {
              traits[f.parentName] = {};
            }
            traits[f.parentName][f.name] = value;
          } else {
            traits[f.name] = value;
          }
        }
      });
    }
  }
  return traits;
}

async function fillMetadata(
  identity: Identity,
  schemaFields: SchemaField[],
  metadataKind: "metadata_public" | "metadata_admin",
): Promise<IdentityTraits> {
  const map =
    await SchemaService.getTableDetailListModelFromKratosIdentity(identity);
  const metadata: MetaData = {};

  for (const [key, value] of Object.entries(map[metadataKind])) {
    if (key !== "key") {
      schemaFields.forEach((f) => {
        if (f.name === key && f.fieldKind === metadataKind) {
          if (f.parentName) {
            if (!metadata[f.parentName]) {
              metadata[f.parentName] = {};
            }
            metadata[f.parentName][f.name] = value;
          } else {
            metadata[f.name] = value;
          }
        }
      });
    }
  }
  return metadata;
}

async function performAction(
  modi: Modi,
  values: ValueObject,
  identity?: Identity,
  schemaId?: string,
): Promise<import("axios").AxiosResponse<Identity>> {
  const kratosConfig = await getKratosConfig();
  const adminAPI = new IdentityApi(kratosConfig.adminConfig);

  if (modi === "edit") {
    const updatededIdenity = await adminAPI.updateIdentity({
      id: identity?.id!,
      updateIdentityBody: {
        schema_id: identity?.schema_id!,
        traits: values.traits,
        state: values.state,
        metadata_public: values.publicMetadata,
        metadata_admin: values.adminMetadata,
      },
    });
    MessageService.Instance.dispatchMessage({
      removeAfterSeconds: 2,
      message: {
        title: "identity updated",
        intent: "success",
      },
    });

    return updatededIdenity;
  } else {
    const newIdenity = await adminAPI.createIdentity({
      createIdentityBody: {
        schema_id: schemaId!,
        traits: values.traits,
        metadata_public: values.publicMetadata,
        metadata_admin: values.adminMetadata,
      },
    });
    MessageService.Instance.dispatchMessage({
      removeAfterSeconds: 2,
      message: {
        title: "new identity created",
        intent: "success",
      },
    });
    return newIdenity;
  }
}

export function EditTraits(props: EditTraitsProps) {
  const [identity] = useState<Identity | undefined>(props.identity);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>();
  const [values, setValues] = useState<ValueObject>();

  const history = useHistory();

  useEffect(() => {
    async function prepare() {
      let newSchemaFields: SchemaField[] = [];
      let valueObject: ValueObject;

      if (identity && props.modi === "edit") {
        newSchemaFields =
          await SchemaService.getSchemaFieldsFromIdentity(identity);
        valueObject = {
          state: identity.state!,
          traits: await fillTraits(identity, newSchemaFields),
          publicMetadata: await fillMetadata(
            identity,
            newSchemaFields,
            "metadata_public",
          ),
          adminMetadata: await fillMetadata(
            identity,
            newSchemaFields,
            "metadata_admin",
          ),
        };
      } else if (props.schema && props.modi === "new") {
        newSchemaFields = SchemaService.getSchemaFields(props.schema);
        valueObject = {
          state: "active",
          traits: {},
          adminMetadata: {},
          publicMetadata: {},
        };
      } else {
        throw new Error(
          "Either identity (modi=edit) or schema (modi=new) has to be definied",
        );
      }

      // array value compare
      if (JSON.stringify(newSchemaFields) !== JSON.stringify(schemaFields)) {
        setSchemaFields(newSchemaFields);
      }

      // array value compare
      if (JSON.stringify(valueObject) !== JSON.stringify(values)) {
        setValues(valueObject);
      }
    }

    prepare();
  });

  const traits =
    schemaFields &&
    schemaFields.filter((elem, _key) => elem.fieldKind === "trait");
  const publicMetadata =
    schemaFields &&
    schemaFields.filter((elem, _key) => elem.fieldKind === "metadata_public");
  const adminMetadata =
    schemaFields &&
    schemaFields.filter((elem, _key) => elem.fieldKind === "metadata_admin");

  return (
    <div>
      <Text
        as="h2"
        style={{
          display: "block",
          fontSize: 20,
          marginTop: 10,
        }}>
        Standard Properties
      </Text>

      {props.modi === "edit" && (
        <>
          <Field label={"Schema"}>
            <Select disabled>
              <option>{props.identity?.schema_id}</option>
            </Select>
          </Field>
        </>
      )}

      {values && (
        <Checkbox
          label="Identity State (active, inactive)"
          defaultChecked={values?.state === "active"}
          onChange={(ev, data) => {
            const newValues = values;
            newValues.state = data.checked ? "active" : "inactive";
            setValues(newValues);
          }}></Checkbox>
      )}

      <Text
        as="h2"
        style={{
          display: "block",
          fontSize: 20,
          marginTop: 10,
        }}>
        Custom Traits
      </Text>
      {values && traits?.length ? (
        traits.map((elem, key) => {
          return (
            <div key={key}>
              <RenderTraitField
                schemaField={elem}
                fieldValues={values}
                setValues={(values) => {
                  setValues(values);
                }}></RenderTraitField>
            </div>
          );
        })
      ) : (
        <p>None</p>
      )}

      {publicMetadata?.length ? (
        <div>
          <Text
            as="h2"
            style={{
              display: "block",
              fontSize: 20,
              marginTop: 10,
            }}>
            Public Metadata
          </Text>
          {values &&
            publicMetadata.map((elem, key) => {
              return (
                <div key={key}>
                  <RenderTraitField
                    schemaField={elem}
                    fieldValues={values}
                    setValues={(values) => {
                      setValues(values);
                    }}></RenderTraitField>
                </div>
              );
            })}
        </div>
      ) : null}

      {adminMetadata?.length ? (
        <div>
          <Text
            as="h2"
            style={{
              display: "block",
              fontSize: 20,
              marginTop: 10,
            }}>
            Admin Metadata
          </Text>
          {values &&
            adminMetadata.map((elem, key) => {
              return (
                <div key={key}>
                  <RenderTraitField
                    schemaField={elem}
                    fieldValues={values}
                    setValues={(values) => {
                      setValues(values);
                    }}></RenderTraitField>
                </div>
              );
            })}
        </div>
      ) : null}

      <div style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
          <Button
            appearance="primary"
            onClick={() => {
              performAction(props.modi, values!, identity, props.schemaId)
                .then((value) => {
                  history.push("/identities/" + value.data.id + "/view");
                })
                .catch((err) => {
                  MessageService.Instance.dispatchMessage({
                    message: {
                      intent: "error",
                      title: JSON.stringify(err.response.data.error),
                    },
                    removeAfterSeconds: 4000,
                  });
                });
            }}>
            {getButtonName(props.modi)}
          </Button>
          <Button onClick={() => history.push("/identities")}>Close</Button>
        </div>
      </div>
    </div>
  );
}
