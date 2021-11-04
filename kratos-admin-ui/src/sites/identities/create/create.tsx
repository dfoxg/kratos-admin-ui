import { DefaultButton, Dropdown, Fabric, IDropdownOption, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { AdminApi, PublicApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import { CONFIG } from "../../../config";
import "./create.scss"

interface CreateIdentitySiteState {
    schemaOptions: IDropdownOption[];
    schema: object;
    schemaName: string;
    schemaFields: SchemaField[]
    errorText?: string;
}

interface Identity {
    [key: string]: string;
}

class CreateIdentitySite extends React.Component<any, CreateIdentitySiteState> {

    state: CreateIdentitySiteState = {
        schemaOptions: [],
        schema: {},
        schemaFields: [],
        schemaName: "",
        errorText: undefined
    }

    identity: Identity = {};

    publicAPI: PublicApi = new PublicApi({ basePath: CONFIG.kratosPublicURL })
    adminAPI: AdminApi = new AdminApi({ basePath: CONFIG.kratosAdminURL })

    componentDidMount() {
        SchemaService.getSchemaIDs().then(data => {
            this.setState({
                schemaOptions: data.map(element => {
                    return {
                        key: element,
                        text: element
                    }
                })
            })
        });
        this.loadSchema({ key: "default", text: "default" });
    }

    loadSchema(schema: IDropdownOption | undefined): any {
        if (schema) {
            this.publicAPI.getSchema(schema.key.toString()).then(data => {
                this.setState({
                    schema: data.data,
                    schemaFields: SchemaService.getSchemaFields(data.data),
                    schemaName: schema.key.toString()
                })
            });
        }
    }

    setValue(name: string, value: string | undefined) {
        if (value) {
            this.identity[name] = value
        }
    }

    create() {
        this.adminAPI.createIdentity({
            schema_id: this.state.schemaName,
            traits: this.identity
        }).then(data => {
            this.props.history.push("/identities");
        }).catch(err => {
            this.setState({
                errorText: JSON.stringify(err.response.data.error)
            })
        })
    }

    render() {
        return (
            <Fabric>
                <div className="container">
                    <h1>Create Identity</h1>
                    <p>Please select the scheme for which you want to create a new identity:</p>
                    <Dropdown
                        defaultSelectedKey="default"
                        label="Select Scheme"
                        options={this.state.schemaOptions}
                        onChange={(event, option) => {
                            this.loadSchema(option)
                        }}
                    />
                    <pre className="schemaPre">{JSON.stringify(this.state.schema, null, 2)}</pre>
                    <hr></hr>
                    {!this.state.errorText || <div className="alert alert-danger">{this.state.errorText}</div>}
                    <div>
                        {this.state.schemaFields.map((elem, key) => {
                            return <TextField
                                key={key}
                                label={elem.title}
                                onChange={(event, value) => {
                                    this.setValue(elem.name, value)
                                }} >
                            </TextField>
                        })}
                        <Stack horizontal tokens={{ childrenGap: 20 }}>
                            <PrimaryButton text="Create" onClick={() => this.create()} />
                            <DefaultButton onClick={() => this.props.history.push("/identities")}>Close</DefaultButton>
                        </Stack>
                    </div>
                </div>
            </Fabric>
        )
    }
}

export default withRouter(CreateIdentitySite);