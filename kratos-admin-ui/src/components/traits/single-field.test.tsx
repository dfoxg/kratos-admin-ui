import { render } from "@testing-library/react";
import { SingleField } from "./single-field";
import { describe, test, expect } from "vitest";

describe("test SingleField", () => {
  test("check boolean return value", async () => {
    const result = render(
      <SingleField
        fieldValues={{
          traits: { test: true },
          publicMetadata: {},
          adminMetadata: {},
          state: "active",
        }}
        setValues={() => {}}
        schemaField={{
          name: "test",
          format: "boolean",
          title: "test",
          fieldKind: "trait",
          required: false,
          type: "boolean",
          subType: "boolean",
        }}
      />,
    );

    const checkbox: HTMLInputElement =
      result.container.querySelector("input")!;

    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBeTruthy();
  });

  test("check string value", async () => {
    const result = render(
      <SingleField
        fieldValues={{
          traits: { test: "jojojo" },
          publicMetadata: {},
          adminMetadata: {},
          state: "active",
        }}
        setValues={() => {}}
        schemaField={{
          name: "test",
          format: "email",
          title: "test",
          fieldKind: "trait",
          required: true,
          type: "string",
          subType: "email",
        }}
      />,
    );

    const input: HTMLInputElement = result.container.querySelector("input")!;
    expect(input).not.toBeNull();
    expect(input.value).toBe("jojojo");
  });
});
