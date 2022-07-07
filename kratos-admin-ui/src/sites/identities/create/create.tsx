import { DefaultButton, Dropdown, IDropdownOption, PrimaryButton, Stack, TextField } from "@fluentui/react";
import { V0alpha2Api } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../../config";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import "./create.scss"

interface CreateIdentitySiteState {
    schemaOptions: IDropdownOption[];
    schema: object;
    schemaName: string;
    schemaFields: SchemaField[]
    errorText?: string;
}


interface Identity {
    [key: string]: any;
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

    componentDidMount() {
        SchemaService.getSchemaIDs().then(data => {
            this.setState({
                schemaOptions: data.map(element => {
                    return {
                        key: element,
                        text: element
                    }
                })
            }, () => {
                if (this.state.schemaOptions.length === 0) {
                    this.loadSchema({ key: "default", text: "default" });
                } else {
                    this.loadSchema(this.state.schemaOptions[0]);
                }
            })
        });
    }

    loadSchema(schema: IDropdownOption | undefined): any {
        if (schema) {
            SchemaService.getSchemaJSON(schema.key.toString()).then(data => {
                this.setState({
                    schema: data,
                    schemaFields: SchemaService.getSchemaFields(data),
                    schemaName: schema.key.toString()
                })
            });
        }
    }

    setValue(field: SchemaField, value: string | undefined) {
        if (value) {
            if (field && field.parentName) {
                if (!this.identity[field.parentName]) {
                    this.identity[field.parentName] = {}
                }
                this.identity[field.parentName][field.name] = value
            } else {
                this.identity[field.name] = value
            }
        }
    }

    create() {
        getKratosConfig().then(config => {
            const adminAPI = new V0alpha2Api(config.adminConfig);
            adminAPI.adminCreateIdentity({
                schema_id: this.state.schemaName,
                traits: this.identity
            }).then(data => {
                this.props.history.push("/identities");
            }).catch(err => {
                this.setState({
                    errorText: JSON.stringify(err.response.data.error)
                })
            })
        })
    }

    render() {
        return (
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
                    <Stack tokens={{ childrenGap: 5 }}>
                        {this.state.schemaFields.map((elem, key) => {
                            return <TextField
                                key={key}
                                label={elem.title}
                                onChange={(event, value) => {
                                    this.setValue(elem, value)
                                }} >
                            </TextField>
                        })}
                    </Stack>
                    <div style={{ marginTop: 20 }}>
                        <Stack horizontal tokens={{ childrenGap: 20 }}>
                            <PrimaryButton text="Create" onClick={() => this.create()} />
                            <DefaultButton onClick={() => this.props.history.push("/identities")}>Close</DefaultButton>
                        </Stack>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(CreateIdentitySite);