import { Label } from "@fluentui/react-components";
import { SchemaField, mapSchemaDataType } from "../../service/schema-service";
import { ValueObject, mapFieldKindToValueKey } from "./edit-traits";
import { SingleField } from "./single-field";
import { MultilineEdit } from "../multiline/multiline";

interface RenderTraitFieldProps {
  schemaField: SchemaField;
  fieldValues: ValueObject;
  setValues(values: ValueObject): void;
}

function getDefaultValue(schemaField: SchemaField, values: ValueObject): any[] {
  const fieldKindKey = mapFieldKindToValueKey(schemaField.fieldKind);
  if (schemaField.type === "array") {
    let value = [];
    if (schemaField.parentName) {
      if (
        values[fieldKindKey][schemaField.parentName] &&
        values[fieldKindKey][schemaField.parentName][schemaField.name]
      ) {
        value = values[fieldKindKey][schemaField.parentName][schemaField.name];
      }
    } else {
      if (values[fieldKindKey][schemaField.name]) {
        value = values[fieldKindKey][schemaField.name];
      }
    }

    if (!(value instanceof Array)) {
      return [value];
    }
    return value;
  }
  throw new Error("Should not be called as non array object!");
}

export function RenderTraitField(props: RenderTraitFieldProps) {
  return (
    <>
      {props.schemaField.type !== "array" && (
        <SingleField
          schemaField={props.schemaField}
          fieldValues={props.fieldValues}
          setValues={(values) => {
            props.setValues(values);
          }}></SingleField>
      )}
      {props.schemaField.type === "array" && (
        <>
          <Label>{props.schemaField.title}</Label>
          <MultilineEdit
            defaultData={getDefaultValue(props.schemaField, props.fieldValues)}
            dataChanged={(data) => {
              const fieldKindKey = mapFieldKindToValueKey(
                props.schemaField.fieldKind,
              );
              if (props.schemaField.parentName) {
                if (
                  !props.fieldValues[fieldKindKey][props.schemaField.parentName]
                ) {
                  props.fieldValues[fieldKindKey][
                    props.schemaField.parentName
                  ] = {};
                }
                props.fieldValues[fieldKindKey][props.schemaField.parentName][
                  props.schemaField.name
                ] = data;
              } else {
                props.fieldValues[fieldKindKey][props.schemaField.name] = data;
              }
              props.setValues(props.fieldValues);
            }}
            datatype={mapSchemaDataType(props.schemaField.format)}
            name={props.schemaField.name}></MultilineEdit>
        </>
      )}
    </>
  );
}
