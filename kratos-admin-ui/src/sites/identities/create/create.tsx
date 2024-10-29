import {
  Title1,
  Option,
  Field,
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionPanel,
  Dropdown,
  Label,
} from "@fluentui/react-components";
import React from "react";
import { withRouter } from "react-router-dom";
import { SchemaService } from "../../../service/schema-service";
import "./create.scss";
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
    schemaName: "",
  };

  componentDidMount() {
    SchemaService.getSchemaIDs().then((data) => {
      this.setState(
        {
          schemaOptions: data.map((element) => {
            return element;
          }),
        },
        () => {
          if (this.state.schemaOptions.length === 0) {
            this.loadSchema("default");
          } else {
            this.loadSchema(this.state.schemaOptions[0]);
          }
        },
      );
    });
  }

  loadSchema(schema: string | undefined): any {
    if (schema) {
      SchemaService.getSchemaJSON(schema).then((data) => {
        this.setState({
          schema: data,
          schemaName: schema,
        });
      });
    }
  }

  render() {
    return (
      <div className="container">
        <Title1 as={"h1"}>Create Identity</Title1>
        <div style={{ marginTop: 10 }}>
          <Label id={"dropdownID"}>
            Please select the scheme for which you want to create a new identity
          </Label>
          <br></br>
          <Dropdown
            aria-labelledby={"dropdownID"}
            style={{ marginBottom: 5 }}
            selectedOptions={this.state.schemaOptions}
            value={this.state.schemaName}
            onOptionSelect={(e, value) => {
              this.loadSchema(value.optionValue);
            }}>
            {this.state.schemaOptions.map((key) => {
              return (
                <Option
                  key={key}
                  text={key}>
                  {key}
                </Option>
              );
            })}
          </Dropdown>
        </div>
        <Accordion collapsible>
          <AccordionItem value={1}>
            <AccordionHeader>Show JSON-Schema</AccordionHeader>
            <AccordionPanel>
              <pre className="schemaPre">
                {JSON.stringify(this.state.schema, null, 2)}
              </pre>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

        {this.state.schema.properties && (
          <EditTraits
            modi="new"
            schema={this.state.schema}
            schemaId={this.state.schemaName}></EditTraits>
        )}
      </div>
    );
  }
}

export default withRouter(CreateIdentitySite);
