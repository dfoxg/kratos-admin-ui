import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SingleField } from './single-field'
import exp from 'constants'

describe("test SingleField", () => {

    test("check boolean return value", async () => {

        const result = render(<SingleField
            fieldValues={
                {
                    traits: { test: true },
                    publicMetadata: {},
                    adminMetadata: {},
                    state: 'active'
                }
            }
            setValues={() => { }}
            schemaField={
                {
                    name: "test",
                    format: "boolean",
                    title: "test",
                    fieldKind: 'trait',
                    required: false,
                    type: "boolean",
                    subType: "boolean"
                }
            }
        />)

        const checkbox: HTMLInputElement = result.container.querySelector("#checkbox-r0")!;
        expect(checkbox).toBeDefined();
        expect(checkbox.checked).toBeTruthy();
    })

    test("check string value", async () => {

        const result = render(<SingleField
            fieldValues={
                {
                    traits: { test: "jojojo" },
                    publicMetadata: {},
                    adminMetadata: {},
                    state: 'active'
                }
            }
            setValues={() => { }}
            schemaField={
                {
                    name: "test",
                    format: "email",
                    title: "test",
                    fieldKind: 'trait',
                    required: true,
                    type: "string",
                    subType: "email"
                }
            }
        />)

        const input: HTMLInputElement = result.container.querySelector("input")!;
        expect(input).toBeDefined();
        expect(input.value).toBe("jojojo")
    })
})