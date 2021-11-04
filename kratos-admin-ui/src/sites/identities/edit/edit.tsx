import { DefaultButton, Fabric, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { AdminApi, Identity, PublicApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import { CONFIG } from "../../../config";

interface EditIdentityState {
    identity?: Identity
    schemaFields: SchemaFieldWithValue[]
    errorText?: string
}

interface SchemaFieldWithValue extends SchemaField {
    value: string;
}

class EditIdentitySite extends React.Component<any, EditIdentityState> {

    adminAPI: AdminApi = new AdminApi({ basePath: CONFIG.kratosAdminURL })
    publicAPI: PublicApi = new PublicApi({ basePath: CONFIG.kratosPublicURL })

    state: EditIdentityState = {
        schemaFields: []
    }

    componentDidMount() {
        this.adminAPI.getIdentity(this.props.match.params.id)
            .then(data => {
                this.publicAPI.getSchema(data.data.schema_id).then(schema => {
                    this.setState({
                        schemaFields: SchemaService.getSchemaFields(schema.data)
                            .map(field => {
                                const traits = data.data.traits as any
                                return {
                                    name: field.name,
                                    title: field.title,
                                    value: traits[field.name]
                                }
                            })
                    })
                });
                this.setState({
                    identity: data.data
                });
            }).catch(err => {
                /* this.setState({
                     identity: err.response.data
                 })*/
            });
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
            this.adminAPI.updateIdentity(this.state.identity?.id, {
                schema_id: this.state.identity?.schema_id,
                traits: this.arrayToObject(this.state.schemaFields)
            }).then(data => {
                this.props.history.push("/identities/" + this.state.identity?.id + "/view")
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
            <Fabric>
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
                                <Stack horizontal tokens={{ childrenGap: 20 }}>
                                    <PrimaryButton onClick={() => this.save()}>Save</PrimaryButton>
                                    <DefaultButton onClick={() => this.props.history.push("/identities")}>Close</DefaultButton>
                                </Stack>
                            </div>
                        </div>}
                </div>
            </Fabric>
        )
    }
}

export default withRouter(EditIdentitySite);