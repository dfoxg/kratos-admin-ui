import React from "react";
import { Checkbox, Field, Input } from "@fluentui/react-components";
import { SchemaField, mapSchemaDataType } from "../../service/schema-service";
import { ValueObject, mapFieldKindToValueKey } from "./edit-traits";

interface SingleFieldProps {
  schemaField: SchemaField;
  fieldValues: ValueObject;
  setValues(values: ValueObject): void;
}

function getDefaultValue(
  schemaField: SchemaField,
  values: ValueObject,
): string {
  const fieldKindKey = mapFieldKindToValueKey(schemaField.fieldKind);
  if (schemaField.type === "array") {
    return "array value!";
  } else {
    if (schemaField.parentName) {
      if (
        values[fieldKindKey][schemaField.parentName] &&
        values[fieldKindKey][schemaField.parentName][schemaField.name]
      ) {
        return values[fieldKindKey][schemaField.parentName][schemaField.name];
      }
    } else {
      if (values[fieldKindKey][schemaField.name]) {
        return values[fieldKindKey][schemaField.name];
      }
    }
  }
  return "";
}

function getBooleanValue(
  schemaField: SchemaField,
  values: ValueObject,
): boolean {
  const val = getDefaultValue(schemaField, values);
  if (val || val == "true") {
    return true;
  }
  return false;
}

function updateInputValue(value: any, props: SingleFieldProps) {
  if (props.fieldValues) {
    const fieldKindKey = mapFieldKindToValueKey(props.schemaField.fieldKind);
    if (props.schemaField.parentName) {
      if (!props.fieldValues[fieldKindKey][props.schemaField.parentName]) {
        props.fieldValues[fieldKindKey][props.schemaField.parentName] = {};
      }
      props.fieldValues[fieldKindKey][props.schemaField.parentName][
        props.schemaField.name
      ] = value;
    } else {
      props.fieldValues[fieldKindKey][props.schemaField.name] = value;
    }
    props.setValues(props.fieldValues);
  }
}

export function SingleField(props: SingleFieldProps) {
  return (
    <>
      {props.schemaField.type === "boolean" && (
        <Checkbox
          label={props.schemaField.title}
          required={props.schemaField.required}
          defaultChecked={getBooleanValue(props.schemaField, props.fieldValues)}
          onChange={(event, value) => {
            updateInputValue(value.checked, props);
          }}></Checkbox>
      )}
      {props.schemaField.type !== "boolean" && (
        <Field
          label={props.schemaField.title}
          required={props.schemaField.required}>
          <Input
            onChange={(event, value) => {
              updateInputValue(value.value, props);
            }}
            defaultValue={getDefaultValue(props.schemaField, props.fieldValues)}
            type={mapSchemaDataType(props.schemaField.format)}></Input>
        </Field>
      )}
    </>
  );
}
