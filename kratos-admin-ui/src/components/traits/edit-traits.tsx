import { Button, Checkbox, Field, Select, Text } from "@fluentui/react-components"
import { Identity, IdentityApi, IdentityState } from "@ory/kratos-client"
import { useEffect, useState } from "react"
import { SchemaField, SchemaService } from "../../service/schema-service";
import { getKratosConfig } from "../../config";
import { useHistory } from "react-router-dom";
import { RenderTraitField } from "./render-field";
import { MetadataRenderer } from "./metadata-renderer";

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
    state: IdentityState
    traits: IdentityTraits;
    publicMetadata: MetaData;
    adminMedataData: MetaData;
}

function getButtonName(modi: Modi) {
    if (modi === "edit") {
        return "Save"
    } else {
        return "Create";
    }
}

async function fillTraits(identity: Identity, schemaFields: SchemaField[]): Promise<IdentityTraits> {
    const map = await SchemaService.getTableDetailListModelFromKratosIdentity(identity);
    const traits: IdentityTraits = {}

    for (const [key, value] of Object.entries(map)) {
        if (key !== "key") {
            schemaFields.forEach(f => {
                if (f.name === key) {
                    if (f.parentName) {
                        if (!traits[f.parentName]) {
                            traits[f.parentName] = {}
                        }
                        traits[f.parentName][f.name] = value
                    } else {
                        traits[f.name] = value
                    }
                }
            });
        }
    }
    return traits;
}



async function performAction(modi: Modi, values: ValueObject, identity?: Identity, schemaId?: string): Promise<import("axios").AxiosResponse<Identity>> {
    const kratosConfig = await getKratosConfig();
    const adminAPI = new IdentityApi(kratosConfig.adminConfig);

    if (modi === "edit") {
        const updatededIdenity = await adminAPI.updateIdentity(
            {
                id: identity?.id!,
                updateIdentityBody: {
                    schema_id: identity?.schema_id!,
                    traits: values.traits,
                    state: values.state,
                    metadata_public: identity?.metadata_public,
                    metadata_admin: identity?.metadata_admin
                }
            })

        return updatededIdenity
    } else {
        const newIdenity = await adminAPI.createIdentity({
            createIdentityBody: {
                schema_id: schemaId!,
                traits: values.traits,
                metadata_admin: kratosConfig.adminConfig.basePath,
                metadata_public: kratosConfig.publicConfig.basePath
            }
        })
        return newIdenity;
    }
}

export function EditTraits(props: EditTraitsProps) {

    const [identity] = useState<Identity | undefined>(props.identity);
    const [schemaFields, setSchemaFields] = useState<SchemaField[]>();
    const [values, setValues] = useState<ValueObject>()
    const [errorText, setErrorText] = useState<string>()

    const history = useHistory();

    useEffect(() => {
        async function prepare() {
            let newSchemaFields: SchemaField[] = []
            let valueObject: ValueObject;

            if (identity && props.modi === "edit") {
                newSchemaFields = await SchemaService.getSchemaFieldsFromIdentity(identity);
                valueObject = {
                    state: identity.state!,
                    traits: await fillTraits(identity, newSchemaFields),
                    publicMetadata: identity.metadata_public,
                    adminMedataData: identity.metadata_admin
                }
            } else if (props.schema && props.modi === "new") {
                newSchemaFields = SchemaService.getSchemaFields(props.schema)
                valueObject = {
                    state: "active",
                    traits: {},
                    adminMedataData: {},
                    publicMetadata: {}
                }
            } else {
                throw new Error("Either identity (modi=edit) or schema (modi=new) has to be definied")
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

        prepare()
    })

    return (
        <div>
            <Text
                as="h2"
                style={{
                    display: "block",
                    fontSize: 20,
                    marginTop: 10
                }}
            >Standard Properties</Text>

            {props.modi === "edit" &&
                <>
                    <Field label={"Schema"}>
                        <Select disabled>
                            <option>{props.identity?.schema_id}</option>
                        </Select>
                    </Field>
                </>
            }

            {values &&
                <Checkbox
                    label="Identity State (active, inactive)"
                    defaultChecked={values?.state === "active"}
                    onChange={(ev, data) => {
                        const newValues = values;
                        newValues.state = data.checked ? "active" : "inactive";
                        setValues(newValues);
                    }}
                ></Checkbox>
            }


            <Text
                as="h2"
                style={{
                    display: "block",
                    fontSize: 20,
                    marginTop: 10
                }}
            >Custom Traits</Text>
            {schemaFields && values && schemaFields.map((elem, key) => {
                return (
                    <div key={key}>
                        <RenderTraitField
                            schemaField={elem}
                            fieldValues={values}
                            setValues={(values) => {
                                setValues(values)
                            }}
                        ></RenderTraitField>
                    </div>
                )
            })}
            {!errorText || <div className="alert alert-danger" style={{ marginTop: 15 }}>{errorText}</div>}
            <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
                    <Button appearance="primary"
                        onClick={() => {
                            performAction(props.modi, values!, identity, props.schemaId)
                                .then(value => {
                                    history.push("/identities/" + value.data.id + "/view")
                                }).catch(err => {
                                    setErrorText(JSON.stringify(err.response.data.error))
                                })
                        }}
                    >{getButtonName(props.modi)}</Button>
                    <Button onClick={() => history.push("/identities")}>Close</Button>
                </div>
            </div>
        </div>
    )

}