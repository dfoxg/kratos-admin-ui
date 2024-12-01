import {
  SchemaField,
  SchemaService,
  mapFieldKindToPropertyKey,
  mapSchemaDataType,
} from "./schema-service";
import { describe, test, expect } from "vitest";

describe("test export functions", () => {
  test("test mapFieldKindToPropertyKey", () => {
    expect(mapFieldKindToPropertyKey("trait")).toBe("traits");
  });

  test("test mapSchemaDataType", () => {
    expect(mapSchemaDataType("email")).toBe("email");
    expect(mapSchemaDataType("number")).toBe("number");
    expect(mapSchemaDataType("time")).toBe("time");
    expect(mapSchemaDataType("date")).toBe("date");
    expect(mapSchemaDataType("wrong")).toBe("text");
  });
});

describe("test getSchemaFields", () => {
  // https://github.com/ory/kratos/blob/master/contrib/quickstart/kratos/email-password/identity.schema.json
  test("test email-password schema", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              title: "E-Mail",
              minLength: 3,
              "ory.sh/kratos": {
                credentials: {
                  password: {
                    identifier: true,
                  },
                },
                verification: {
                  via: "email",
                },
                recovery: {
                  via: "email",
                },
              },
            },
            name: {
              type: "object",
              properties: {
                first: {
                  title: "First Name",
                  type: "string",
                },
                last: {
                  title: "Last Name",
                  type: "string",
                },
              },
            },
          },
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(3);

    expect(fields[0].parentName).toBe(undefined);
    expect(fields[0].name).toBe("email");
    expect(fields[0].title).toBe("E-Mail");
    expect(fields[0].type).toBe("string");
    expect(fields[0].fieldKind).toBe("trait");

    expect(fields[1].parentName).toBe("name");
    expect(fields[1].name).toBe("first");
    expect(fields[1].title).toBe("First Name");
    expect(fields[1].type).toBe("string");
    expect(fields[1].fieldKind).toBe("trait");

    expect(fields[2].parentName).toBe("name");
    expect(fields[2].name).toBe("last");
    expect(fields[2].title).toBe("Last Name");
    expect(fields[2].type).toBe("string");
    expect(fields[2].fieldKind).toBe("trait");
  });

  test("test schema required fields", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              title: "E-Mail",
              minLength: 3,
              "ory.sh/kratos": {
                credentials: {
                  password: {
                    identifier: true,
                  },
                },
                verification: {
                  via: "email",
                },
                recovery: {
                  via: "email",
                },
              },
            },
            name: {
              type: "object",
              properties: {
                first: {
                  title: "First Name",
                  type: "string",
                },
                last: {
                  title: "Last Name",
                  type: "string",
                },
              },
            },
          },
          required: ["email"],
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(3);

    expect(fields[0].parentName).toBe(undefined);
    expect(fields[0].name).toBe("email");
    expect(fields[0].title).toBe("E-Mail");
    expect(fields[0].required).toBe(true);
  });

  test("test array properties schema", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: [
                {
                  type: "string",
                  format: "email",
                  title: "E-Mail",
                  "ory.sh/kratos": {
                    credentials: {
                      password: {
                        identifier: true,
                      },
                      webauthn: {
                        identifier: true,
                      },
                      totp: {
                        account_name: true,
                      },
                    },
                    recovery: {
                      via: "email",
                    },
                    verification: {
                      via: "email",
                    },
                  },
                  maxLength: 320,
                },
              ],
            },
          },
          required: ["emails"],
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(1);
    expect(fields[0].type).toBe("array");
    expect(fields[0].subType).toBe("string");
    expect(fields[0].title).toBe("E-Mail");
  });

  test("test array properties mixed schema with array of items", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: [
                {
                  type: "string",
                  format: "email",
                  title: "E-Mail",
                  "ory.sh/kratos": {
                    credentials: {
                      password: {
                        identifier: true,
                      },
                      webauthn: {
                        identifier: true,
                      },
                      totp: {
                        account_name: true,
                      },
                    },
                    recovery: {
                      via: "email",
                    },
                    verification: {
                      via: "email",
                    },
                  },
                  maxLength: 320,
                },
              ],
            },
            name: {
              type: "object",
              properties: {
                first: {
                  title: "First Name",
                  type: "string",
                },
                last: {
                  title: "Last Name",
                  type: "string",
                },
              },
            },
          },
          required: ["emails", "name"],
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(3);
    expect(fields[0].type).toBe("array");
    expect(fields[0].subType).toBe("string");
    expect(fields[1].type).toBe("string");
    expect(fields[2].type).toBe("string");
  });

  test("test array properties mixed schema with single item", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            emails: {
              type: "array",
              items: {
                type: "string",
                format: "email",
                title: "E-Mail",
                "ory.sh/kratos": {
                  credentials: {
                    password: {
                      identifier: true,
                    },
                    webauthn: {
                      identifier: true,
                    },
                    totp: {
                      account_name: true,
                    },
                  },
                  recovery: {
                    via: "email",
                  },
                  verification: {
                    via: "email",
                  },
                },
                maxLength: 320,
              },
            },
            name: {
              type: "object",
              properties: {
                first: {
                  title: "First Name",
                  type: "string",
                },
                last: {
                  title: "Last Name",
                  type: "string",
                },
              },
            },
          },
          required: ["emails", "name"],
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(3);
    expect(fields[0].type).toBe("array");
    expect(fields[0].subType).toBe("string");
    expect(fields[1].type).toBe("string");
    expect(fields[2].type).toBe("string");
  });

  test("test public metadata schema", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              title: "E-Mail",
              minLength: 3,
              "ory.sh/kratos": {
                credentials: {
                  password: {
                    identifier: true,
                  },
                },
                verification: {
                  via: "email",
                },
                recovery: {
                  via: "email",
                },
              },
            },
          },
          required: ["email"],
          additionalProperties: false,
        },
        metadata_public: {
          type: "object",
          properties: {
            groups: {
              title: "Groups",
              type: "array",
              items: {
                type: "string",
              },
            },
          },
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(2);
    expect(fields[0].type).toBe("string");
    expect(fields[0].title).toBe("E-Mail");
    expect(fields[0].fieldKind).toBe("trait");

    expect(fields[1].type).toBe("array");
    expect(fields[1].subType).toBe("string");
    expect(fields[1].title).toBe("Groups");
    expect(fields[1].fieldKind).toBe("metadata_public");
  });

  test("test admin metadata schema", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
      title: "Person",
      type: "object",
      properties: {
        traits: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              title: "E-Mail",
              minLength: 3,
              "ory.sh/kratos": {
                credentials: {
                  password: {
                    identifier: true,
                  },
                },
                verification: {
                  via: "email",
                },
                recovery: {
                  via: "email",
                },
              },
            },
          },
          required: ["email"],
          additionalProperties: false,
        },
        metadata_admin: {
          type: "object",
          properties: {
            notes: {
              title: "Notes",
              type: "string",
            },
          },
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

    expect(fields.length).toBe(2);
    expect(fields[0].type).toBe("string");
    expect(fields[0].title).toBe("E-Mail");
    expect(fields[0].fieldKind).toBe("trait");

    expect(fields[1].type).toBe("string");
    expect(fields[1].title).toBe("Notes");
    expect(fields[1].fieldKind).toBe("metadata_admin");
  });

  test("test boolean schema", () => {
    const schema = {
      $id: "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "Person",
      type: "object",
      definitions: {
        tosUrl: {
          type: "string",
          const: "http://example.com/terms",
        },
      },
      properties: {
        traits: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              title: "E-Mail",
              minLength: 3,
              "ory.sh/kratos": {
                credentials: {
                  password: {
                    identifier: true,
                  },
                },
                verification: {
                  via: "email",
                },
                recovery: {
                  via: "email",
                },
              },
            },
            username: {
              title: "Username",
              type: "string",
              readOnly: true,
            },
            name: {
              type: "object",
              properties: {
                first: {
                  title: "First Name",
                  type: "string",
                },
                last: {
                  title: "Last Name",
                  type: "string",
                },
              },
            },
            tos: {
              title: "Accept Terms of Service",
              type: "boolean",
              description: "I accept the terms of service",
              writeOnly: true,
              tosUrl: {
                $ref: "#/definitions/tosUrl",
              },
            },
            newsletter: {
              type: "boolean",
              title: "Newsletter subscription",
            },
          },
          required: ["email", "username", "tos"],
          additionalProperties: false,
        },
      },
    };

    const fields: SchemaField[] = SchemaService.getSchemaFields(schema);
    expect(fields[4].type).toBe("boolean");
  });

  test("empty schema", () => {
    const fields: SchemaField[] = SchemaService.getSchemaFields(null);
    expect(fields).toStrictEqual([]);

    const fields2: SchemaField[] = SchemaService.getSchemaFields(undefined);
    expect(fields2).toStrictEqual([]);
  });
});
