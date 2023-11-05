import { SchemaField, SchemaService } from "./schema-service"

describe("test getSchemaFields", () => {

    // https://github.com/ory/kratos/blob/master/contrib/quickstart/kratos/email-password/identity.schema.json
    test("test email-password schema", () => {
        const schema = {
            "$id": "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Person",
            "type": "object",
            "properties": {
                "traits": {
                    "type": "object",
                    "properties": {
                        "email": {
                            "type": "string",
                            "format": "email",
                            "title": "E-Mail",
                            "minLength": 3,
                            "ory.sh/kratos": {
                                "credentials": {
                                    "password": {
                                        "identifier": true
                                    }
                                },
                                "verification": {
                                    "via": "email"
                                },
                                "recovery": {
                                    "via": "email"
                                }
                            }
                        },
                        "name": {
                            "type": "object",
                            "properties": {
                                "first": {
                                    "title": "First Name",
                                    "type": "string"
                                },
                                "last": {
                                    "title": "Last Name",
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "additionalProperties": false
                }
            }
        }

        const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

        expect(fields.length).toBe(3);

        expect(fields[0].parentName).toBe(undefined)
        expect(fields[0].name).toBe("email")
        expect(fields[0].title).toBe("E-Mail")
        expect(fields[0].type).toBe("string")

        expect(fields[1].parentName).toBe("name")
        expect(fields[1].name).toBe("first")
        expect(fields[1].title).toBe("First Name")
        expect(fields[1].type).toBe("string")

        expect(fields[2].parentName).toBe("name")
        expect(fields[2].name).toBe("last")
        expect(fields[2].title).toBe("Last Name")
        expect(fields[2].type).toBe("string")


    })

    test("test schema required fields", () => {
        const schema = {
            "$id": "https://schemas.ory.sh/presets/kratos/quickstart/email-password/identity.schema.json",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "Person",
            "type": "object",
            "properties": {
                "traits": {
                    "type": "object",
                    "properties": {
                        "email": {
                            "type": "string",
                            "format": "email",
                            "title": "E-Mail",
                            "minLength": 3,
                            "ory.sh/kratos": {
                                "credentials": {
                                    "password": {
                                        "identifier": true
                                    }
                                },
                                "verification": {
                                    "via": "email"
                                },
                                "recovery": {
                                    "via": "email"
                                }
                            }
                        },
                        "name": {
                            "type": "object",
                            "properties": {
                                "first": {
                                    "title": "First Name",
                                    "type": "string"
                                },
                                "last": {
                                    "title": "Last Name",
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "required": ["email"],
                    "additionalProperties": false
                }
            }
        }

        const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

        expect(fields.length).toBe(3);

        expect(fields[0].parentName).toBe(undefined)
        expect(fields[0].name).toBe("email")
        expect(fields[0].title).toBe("E-Mail")
        expect(fields[0].required).toBe(true)

    })

    test("test array properties schema", () => {
        const schema = {
            "$id": "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
            "title": "Person",
            "type": "object",
            "properties": {
                "traits": {
                    "type": "object",
                    "properties": {
                        "emails": {
                            "type": "array",
                            "items": [
                                {
                                    "type": "string",
                                    "format": "email",
                                    "title": "E-Mail",
                                    "ory.sh/kratos": {
                                        "credentials": {
                                            "password": {
                                                "identifier": true
                                            },
                                            "webauthn": {
                                                "identifier": true
                                            },
                                            "totp": {
                                                "account_name": true
                                            }
                                        },
                                        "recovery": {
                                            "via": "email"
                                        },
                                        "verification": {
                                            "via": "email"
                                        }
                                    },
                                    "maxLength": 320
                                }
                            ]
                        }
                    },
                    "required": ["emails"],
                    "additionalProperties": false
                }
            }
        }

        const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

        expect(fields.length).toBe(1);
        expect(fields[0].type).toBe("array");
        expect(fields[0].subType).toBe("string");
        expect(fields[0].title).toBe("E-Mail");
    })

    test("test array properties mixed schema with array of items", () => {
        const schema = {
            "$id": "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
            "title": "Person",
            "type": "object",
            "properties": {
                "traits": {
                    "type": "object",
                    "properties": {
                        "emails": {
                            "type": "array",
                            "items": [
                                {
                                    "type": "string",
                                    "format": "email",
                                    "title": "E-Mail",
                                    "ory.sh/kratos": {
                                        "credentials": {
                                            "password": {
                                                "identifier": true
                                            },
                                            "webauthn": {
                                                "identifier": true
                                            },
                                            "totp": {
                                                "account_name": true
                                            }
                                        },
                                        "recovery": {
                                            "via": "email"
                                        },
                                        "verification": {
                                            "via": "email"
                                        }
                                    },
                                    "maxLength": 320
                                }
                            ]
                        },
                        "name": {
                            "type": "object",
                            "properties": {
                                "first": {
                                    "title": "First Name",
                                    "type": "string"
                                },
                                "last": {
                                    "title": "Last Name",
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "required": ["emails", "name"],
                    "additionalProperties": false
                }
            }
        }

        const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

        expect(fields.length).toBe(3);
        expect(fields[0].type).toBe("array");
        expect(fields[0].subType).toBe("string");
        expect(fields[1].type).toBe("string");
        expect(fields[2].type).toBe("string");
    })

    test("test array properties mixed schema with single item", () => {
        const schema = {
            "$id": "https://schemas.ory.sh/presets/kratos/identity.email.schema.json",
            "title": "Person",
            "type": "object",
            "properties": {
                "traits": {
                    "type": "object",
                    "properties": {
                        "emails": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "format": "email",
                                "title": "E-Mail",
                                "ory.sh/kratos": {
                                    "credentials": {
                                        "password": {
                                            "identifier": true
                                        },
                                        "webauthn": {
                                            "identifier": true
                                        },
                                        "totp": {
                                            "account_name": true
                                        }
                                    },
                                    "recovery": {
                                        "via": "email"
                                    },
                                    "verification": {
                                        "via": "email"
                                    }
                                },
                                "maxLength": 320
                            }
                        },
                        "name": {
                            "type": "object",
                            "properties": {
                                "first": {
                                    "title": "First Name",
                                    "type": "string"
                                },
                                "last": {
                                    "title": "Last Name",
                                    "type": "string"
                                }
                            }
                        }
                    },
                    "required": ["emails", "name"],
                    "additionalProperties": false
                }
            }
        }

        const fields: SchemaField[] = SchemaService.getSchemaFields(schema);

        expect(fields.length).toBe(3);
        expect(fields[0].type).toBe("array");
        expect(fields[0].subType).toBe("string");
        expect(fields[1].type).toBe("string");
        expect(fields[2].type).toBe("string");
    })
})