import { DefaultButton, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { Identity, IdentityState, V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
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
        const adminAPI = new V0alpha2Api(config.adminConfig);
        const entity = await adminAPI.adminGetIdentity(id);
        const schema = await SchemaService.getSchemaJSON(entity.data.schema_id);
        const schemaFields = SchemaService.getSchemaFields(schema);
        const map = SchemaService.mapKratosIdentity(entity.data, schemaFields);

        const traits: Traits = {}
        for (const [key, value] of Object.entries(map)) {
            if (key !== "key") {
                schemaFields.forEach(f => {
                    if (f.name === key) {
                        array.push({
                            name: key,
                            value: value,
                            title: f.title,
                            parentName: f.parentName
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
                const adminAPI = new V0alpha2Api(config.adminConfig);
                adminAPI.adminUpdateIdentity(this.state.identity?.id!, {
                    schema_id: this.state.identity?.schema_id!,
                    traits: this.state.traits,
                    state: IdentityState.Active
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
                <h1>Edit Identity</h1>
                {!this.state.identity ||
                    <div>
                        {!this.state.errorText || <div className="alert alert-danger">{this.state.errorText}</div>}
                        <div>
                            {this.state.schemaFields.map((elem, key) => {
                                return <TextField
                                    key={key}
                                    label={elem.title}
                                    defaultValue={elem.value}
                                    onChange={(event, value) => {
                                        this.patchField(elem, value)
                                    }} >
                                </TextField>
                            })}
                            <div style={{ marginTop: 20 }}>
                                <Stack horizontal tokens={{ childrenGap: 20 }}>
                                    <PrimaryButton onClick={() => this.save()}>Save</PrimaryButton>
                                    <DefaultButton onClick={() => this.props.history.push("/identities")}>Close</DefaultButton>
                                </Stack>
                            </div>
                        </div>
                    </div>}
            </div>
        )
    }
}

export default withRouter(EditIdentitySite);