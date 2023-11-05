import { Label } from "@fluentui/react-components"
import { SchemaField, mapSchemaDataType } from "../../service/schema-service"
import { ValueObject } from "./edit-traits"
import { SingleField } from "./single-field"
import { MultilineEdit } from "../multiline/multiline"

interface RenderTraitFieldProps {
    schemaField: SchemaField,
    fieldValues: ValueObject
    setValues(values: ValueObject): void
}

function getDefaultValue(schemaField: SchemaField, values: ValueObject): any[] {
    if (schemaField.type === "array") {
        if (schemaField.parentName) {
            if (values.traits[schemaField.parentName] && values.traits[schemaField.parentName][schemaField.name]) {
                return values.traits[schemaField.parentName][schemaField.name];
            }
        } else {
            if (values.traits[schemaField.name]) {
                return values.traits[schemaField.name];
            }
        }
        return []
    }
    throw new Error("Should not be called as non array object!")
}

export function RenderTraitField(props: RenderTraitFieldProps) {

    return (
        <>
            {props.schemaField.type !== "array" &&
                <SingleField
                    schemaField={props.schemaField}
                    fieldValues={props.fieldValues}
                    setValues={(values) => {
                        props.setValues(values)
                    }}
                ></SingleField>
            }
            {props.schemaField.type === "array" &&
                <>
                    <Label>{props.schemaField.title}</Label>
                    <MultilineEdit
                        defaultData={getDefaultValue(props.schemaField, props.fieldValues)}
                        dataChanged={(data) => {
                            if (props.schemaField.parentName) {
                                if (!props.fieldValues.traits[props.schemaField.parentName]) {
                                    props.fieldValues.traits[props.schemaField.parentName] = {}
                                }
                                props.fieldValues.traits[props.schemaField.parentName][props.schemaField.name] = data
                            } else {
                                props.fieldValues.traits[props.schemaField.name] = data
                            }
                            props.setValues(props.fieldValues)
                        }}
                        datatype={mapSchemaDataType(props.schemaField.format)}
                        name={props.schemaField.name}
                    ></MultilineEdit>
                </>
            }

        </>
    )

}