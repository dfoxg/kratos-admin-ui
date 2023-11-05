import { Button, Title1, Select, Input, Field, Title2, Title3 } from "@fluentui/react-components";
import { IdentityApi } from "@ory/kratos-client";
import React from "react";
import { withRouter } from "react-router-dom";
import { getKratosConfig } from "../../../config";
import { SchemaField, SchemaService } from "../../../service/schema-service";
import "./create.scss"

interface CreateIdentitySiteState {
    schemaOptions: string[];
    schema: any;
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
                    return element
                })
            }, () => {
                if (this.state.schemaOptions.length === 0) {
                    this.loadSchema("default");
                } else {
                    this.loadSchema(this.state.schemaOptions[0]);
                }
            })
        });
    }

    loadSchema(schema: string | undefined): any {
        if (schema) {
            SchemaService.getSchemaJSON(schema).then(data => {
                this.setState({
                    schema: data,
                    schemaFields: SchemaService.getSchemaFields(data),
                    schemaName: schema
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
            const adminAPI = new IdentityApi(config.adminConfig);
            adminAPI.createIdentity({
                createIdentityBody: {
                    schema_id: this.state.schemaName,
                    traits: this.identity,
                    metadata_admin: config.adminConfig.basePath,
                    metadata_public: config.publicConfig.basePath
                }
            }).then(data => {
                this.props.history.push("/identities");
            }).catch(err => {
                this.setState({
                    errorText: JSON.stringify(err.response.data.error)
                })
            })
        })
    }

    renderField(field: SchemaField) {
        return <> <Field
            label={field.title}
            required={field.required}>
            <Input onChange={(event, value) => {
                this.setValue(field, value.value)
            }} />
        </Field >
        </>
    }

    render() {
        return (
            <div className="container">
                <Title1 as={"h1"}>Create Identity</Title1>
                <p>Please select the scheme for which you want to create a new identity:</p>
                <div>
                    <Select
                        style={{ marginBottom: 5 }}
                        defaultValue={this.state.schemaName}
                        onChange={(e, value) => this.loadSchema(value.value)}>
                        {this.state.schemaOptions.map(key => {
                            return (
                                <option key={key}>
                                    {key}
                                </option>
                            )
                        })}
                    </Select>
                </div>
                <pre className="schemaPre">{JSON.stringify(this.state.schema, null, 2)}</pre>
                <hr></hr>
                <Title2>Properties for {this.state.schema.title}</Title2>
                {!this.state.errorText || <div className="alert alert-danger">{this.state.errorText}</div>}
                <div>
                    <div>
                        {this.state.schemaFields.map((elem, key) => {
                            if (elem.type === "array") {
                                console.log(elem)
                                return (<div key={key}>
                                    <Title3>{elem.title}</Title3>
                                    <button>Add Element</button>
                                    {this.renderField(elem)}
                                </div>)
                            } else {
                                return (<div key={key}>
                                    {this.renderField(elem)}
                                </div>)
                            }
                        })}
                    </div>
                    <div style={{ marginTop: 20 }}>
                        <div style={{ display: "flex", gap: 20 }}>
                            <Button appearance="primary" onClick={() => this.create()}>Create</Button>
                            <Button onClick={() => this.props.history.push("/identities")}>Close</Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(CreateIdentitySite);