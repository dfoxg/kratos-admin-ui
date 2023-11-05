import { Button, Input, Title1, Title2, Field, Checkbox } from "@fluentui/react-components";
import { Identity, IdentityState, IdentityApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { ListSessions } from "../../../components/sessions/list-sessions";
import { getKratosConfig } from "../../../config";
import { SchemaField, SchemaService } from "../../../service/schema-service";

interface EditIdentityState {
    identity?: Identity
    schemaFields: SchemaFieldWithValue[]
    errorText?: string
    traits: Traits;
}

interface SchemaFieldWithValue extends SchemaField {
    value: any;
}

interface Traits {
    [key: string]: any;
}

class EditIdentitySite extends React.Component<any, EditIdentityState> {

    state: EditIdentityState = {
        schemaFields: [],
        traits: {}
    }

    componentDidMount() {
        this.mapEntity(this.props.match.params.id).then(() => { })
    }

    async mapEntity(id: any): Promise<SchemaFieldWithValue[]> {
        const array: SchemaFieldWithValue[] = []
        const config = await getKratosConfig()
        const adminAPI = new IdentityApi(config.adminConfig);
        const entity = await adminAPI.getIdentity({
            id: id
        });
        await SchemaService.getSchemaIDs()
        const schema = await SchemaService.getSchemaJSON(entity.data.schema_id);
        const schemaFields = SchemaService.getSchemaFields(schema);
        const map = await SchemaService.getTableDetailListModelFromKratosIdentity(entity.data);

        const traits: Traits = {}
        for (const [key, value] of Object.entries(map)) {
            if (key !== "key") {
                schemaFields.forEach(f => {
                    if (f.name === key) {
                        array.push({
                            name: key,
                            value: value,
                            title: f.title,
                            parentName: f.parentName,
                            required: f.required,
                            type: f.type,
                            subType: f.subType
                        })

                        if (f.parentName) {
                            if (!traits[f.parentName]) {
                                traits[f.parentName] = {}
                            }
                            traits[f.parentName][key] = value;
                        } else {
                            traits[key] = value;
                        }
                    }
                });
            }
        }
        this.setState({
            identity: entity.data,
            schemaFields: array,
            traits: traits
        })

        return array;
    }

    patchField(field: SchemaFieldWithValue, value: string | undefined) {
        if (value) {
            const traits = this.state.traits;
            if (field.parentName) {
                traits[field.parentName][field.name] = value
            } else {
                traits[field.name] = value;
            }
            this.setState({
                traits: traits
            })
        }
    }

    save() {
        if (this.state.identity) {
            getKratosConfig().then(config => {
                const adminAPI = new IdentityApi(config.adminConfig);
                adminAPI.updateIdentity(
                    {
                        id: this.state.identity?.id!,
                        updateIdentityBody: {
                            schema_id: this.state.identity?.schema_id!,
                            traits: this.state.traits,
                            state: this.state.identity?.state!,
                            metadata_public: this.state.identity?.metadata_public,
                            metadata_admin: this.state.identity?.metadata_admin
                        }
                    }).then(data => {
                        this.props.history.push("/identities/" + this.state.identity?.id + "/view")
                    }).catch(err => {
                        this.setState({ errorText: JSON.stringify(err.response.data.error) })
                    })
            })
        }
    }

    arrayToObject(fields: SchemaFieldWithValue[]): any {
        const obj: any = {}
        fields.forEach(field => {
            obj[field.name] = field.value
        });
        return obj;
    }

    render() {
        return (
            <div className="container">
                <Title1 as={"h1"}>Edit Identity</Title1>
                {!this.state.identity ||
                    <div>
                        {!this.state.errorText || <div className="alert alert-danger">{this.state.errorText}</div>}
                        <div>
                            <Title2>Standard Properties</Title2>
                            <p></p>
                            <Checkbox
                                label="Active"
                                defaultChecked={this.state.identity.state === "active"}
                                onChange={(ev, data) => {
                                    const newIdentity = this.state.identity
                                    newIdentity!.state = data.checked ? "active" : "inactive";
                                    this.setState({
                                        identity: newIdentity
                                    })
                                }}
                            ></Checkbox>
                            <p></p>
                            <Title2>Traits</Title2>
                            {this.state.schemaFields.map((elem, key) => {
                                return (
                                    <div key={key}>
                                        <Field
                                            label={elem.title}
                                            required={elem.required}
                                        >
                                            <Input
                                                onChange={(event, value) => {
                                                    this.patchField(elem, value.value)
                                                }}
                                                defaultValue={elem.value}
                                            ></Input>
                                        </Field>
                                    </div>
                                )
                            })}
                            <div style={{ marginTop: 20 }}>
                                <div style={{ display: "flex", gap: 20, marginBottom: 15 }}>
                                    <Button appearance="primary" onClick={() => this.save()}>Save</Button>
                                    <Button onClick={() => this.props.history.push("/identities")}>Close</Button>
                                </div>
                            </div>
                        </div>
                        <div>
                            <Title2>Sessions</Title2>
                            <ListSessions identity_id={this.state.identity.id}></ListSessions>
                        </div>
                    </div>}
            </div>
        )
    }
}

export default withRouter(EditIdentitySite);