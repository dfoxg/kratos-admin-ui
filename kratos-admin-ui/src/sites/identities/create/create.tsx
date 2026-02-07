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
import { SchemaService } from "../../../service/schema-service";
import "./create.scss";
import { EditTraits } from "../../../components/traits/edit-traits";

interface CreateIdentitySiteState {
  schemaOptions: string[];
  schema: any;
  schemaName: string;
}

export const CreateIdentitySite: React.FC = () => {
  const [schemaOptions, setSchemaOptions] = React.useState<string[]>([]);
  const [schema, setSchema] = React.useState<any>({});
  const [schemaName, setSchemaName] = React.useState<string>("");

  React.useEffect(() => {
    SchemaService.getSchemaIDs().then((data) => {
      const opts = data.map((element) => element);
      setSchemaOptions(opts);
      if (opts.length === 0) {
        loadSchema("default");
      } else {
        loadSchema(opts[0]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function loadSchema(s: string | undefined) {
    if (s) {
      SchemaService.getSchemaJSON(s).then((data) => {
        setSchema(data);
        setSchemaName(s);
      });
    }
  }

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
          selectedOptions={schemaOptions}
          value={schemaName}
          onOptionSelect={(e, value) => {
            loadSchema(value.optionValue);
          }}>
          {schemaOptions.map((key) => {
            return (
              <Option key={key} text={key}>
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
            <pre className="schemaPre">{JSON.stringify(schema, null, 2)}</pre>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>

      {schema.properties && (
        <EditTraits modi="new" schema={schema} schemaId={schemaName}></EditTraits>
      )}
    </div>
  );
};

export default CreateIdentitySite;
