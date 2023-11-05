import { Title1, Select, Field } from "@fluentui/react-components";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaService } from "../../../service/schema-service";
import "./create.scss"
import { EditTraits } from "../../../components/traits/edit-traits";

interface CreateIdentitySiteState {
    schemaOptions: string[];
    schema: any;
    schemaName: string;
}

class CreateIdentitySite extends React.Component<any, CreateIdentitySiteState> {

    state: CreateIdentitySiteState = {
        schemaOptions: [],
        schema: {},
        schemaName: ""
    }

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
                    schemaName: schema
                })
            });
        }
    }

    render() {
        return (
            <div className="container">
                <Title1 as={"h1"}>Create Identity</Title1>
                <div>
                    <Field
                        label={"Please select the scheme for which you want to create a new identity"}>
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
                    </Field>
                </div>
                <pre className="schemaPre">{JSON.stringify(this.state.schema, null, 2)}</pre>
                <hr></hr>

                {this.state.schema.properties &&
                    <EditTraits
                        modi="new"
                        schema={this.state.schema}
                        schemaId={this.state.schemaName}
                    ></EditTraits>
                }
            </div>
        )
    }
}

export default withRouter(CreateIdentitySite);