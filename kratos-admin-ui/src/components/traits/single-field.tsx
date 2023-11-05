import { Field, Input } from "@fluentui/react-components"
import { SchemaField, mapSchemaDataType } from "../../service/schema-service"
import { ValueObject } from "./edit-traits"

interface SingleFieldProps {
    schemaField: SchemaField,
    fieldValues: ValueObject
    setValues(values: ValueObject): void
}

function getDefaultValue(schemaField: SchemaField, values: ValueObject): string {
    if (schemaField.type === "array") {
        return "array value!"
    } else {
        if (schemaField.parentName) {
            if (values.traits[schemaField.parentName] && values.traits[schemaField.parentName][schemaField.name]) {
                return values.traits[schemaField.parentName][schemaField.name];
            }
        } else {
            if (values.traits[schemaField.name]) {
                return values.traits[schemaField.name];
            }
        }
    }
    return "";
}

export function SingleField(props: SingleFieldProps) {

    return (
        <>
            <Field
                label={props.schemaField.title}
                required={props.schemaField.required}
            >
                <Input
                    onChange={(event, value) => {
                        if (props.fieldValues) {
                            if (props.schemaField.parentName) {
                                if (!props.fieldValues.traits[props.schemaField.parentName]) {
                                    props.fieldValues.traits[props.schemaField.parentName] = {}
                                }
                                props.fieldValues.traits[props.schemaField.parentName][props.schemaField.name] = value.value
                            } else {
                                props.fieldValues.traits[props.schemaField.name] = value.value
                            }
                            props.setValues(props.fieldValues)
                        }
                    }}
                    defaultValue={getDefaultValue(props.schemaField, props.fieldValues)}
                    type={mapSchemaDataType(props.schemaField.format)}
                ></Input>
            </Field>
        </>
    )

}