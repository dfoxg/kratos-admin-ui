import { DefaultButton, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { Identity, IdentityState, V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import { KRATOS_ADMIN_CONFIG, KRATOS_PUBLIC_CONFIG } from "../../../config";

interface EditIdentityState {
    identity?: Identity
    schemaFields: SchemaFieldWithValue[]
    errorText?: string
}

interface SchemaFieldWithValue extends SchemaField {
    value: string;
}

class EditIdentitySite extends React.Component<any, EditIdentityState> {

    private adminAPI = new V0alpha2Api(KRATOS_ADMIN_CONFIG);
    private publicAPI = new V0alpha2Api(KRATOS_PUBLIC_CONFIG);

    state: EditIdentityState = {
        schemaFields: []
    }

    componentDidMount() {
        this.mapEntity(this.props.match.params.id).then(() => { })
    }

    async mapEntity(id: any): Promise<SchemaFieldWithValue[]> {
        const array: SchemaFieldWithValue[] = []
        const entity = await this.adminAPI.adminGetIdentity(id);
        const schema = await SchemaService.getSchemaJSON(entity.data.schema_id);
        const schemaFields = SchemaService.getSchemaFields(schema);
        const map = SchemaService.mapKratosIdentity(entity.data, schemaFields);

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
                    }
                });
            }
        }

        this.setState({
            identity: entity.data,
            schemaFields: array
        })

        return array;
    }

    patchField(name: string, value: string | undefined) {
        if (value) {
            this.setState({
                schemaFields: this.state.schemaFields.map(elem => {
                    if (elem.name === name) {
                        elem.value = value;
                        return elem;
                    }
                    return elem;
                })
            })
        }
    }

    save() {
        if (this.state.identity) {
            this.adminAPI.adminUpdateIdentity(this.state.identity?.id, {
                schema_id: this.state.identity?.schema_id,
                traits: this.arrayToObject(this.state.schemaFields),
                state: IdentityState.Active
            }).then(data => {
                console.log(data)
                this.props.history.push("/identities/" + this.state.identity?.id + "/view")
            }).catch(err => {
                this.setState({ errorText: JSON.stringify(err.response.data.error) })
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
                                        this.patchField(elem.name, value)
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