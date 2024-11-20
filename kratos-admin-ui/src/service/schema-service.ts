import {
  Identity,
  IdentityApi,
  IdentitySchemaContainer,
} from "@ory/kratos-client";
import { getKratosConfig } from "../config";

export type FieldKind = "trait" | "metadata_public" | "metadata_admin";

export type FluentUIInputDataType =
  | "number"
  | "time"
  | "text"
  | "tel"
  | "url"
  | "email"
  | "date"
  | "datetime-local"
  | "month"
  | "password"
  | "week";

export function mapFieldKindToPropertyKey(fieldKind: FieldKind) {
  return fieldKind === "trait" ? "traits" : fieldKind;
}

export function mapSchemaDataType(type: string): FluentUIInputDataType {
  switch (type) {
    case "email":
      return "email";
    case "number":
      return "number";
    case "time":
      return "time";
    case "date":
      return "date";
    default:
      return "text";
  }
}

export interface SchemaField {
  name: string;
  fieldKind: FieldKind;
  title: string;
  type: string;
  subType: string;
  parentName?: string;
  required: boolean;
  format: string;
}

export interface TableDetailListModel {
  key: string;
  state: string;
  schema: string;
  verifiable_addresses: string;
  traits: { [key: string]: string };
  metadata_public: { [key: string]: string };
  metadata_admin: { [key: string]: string };
}

export class SchemaService {
  private static schema_ids: string[] = [];
  private static schema_map: Map<string, any> = new Map<string, any>();

  static async getSchemaIDs(): Promise<string[]> {
    if (this.schema_ids.length === 0) {
      const config = await getKratosConfig();
      const publicAPI = new IdentityApi(config.publicConfig);
      return publicAPI.listIdentitySchemas().then((data) => {
        this.extractSchemas(data.data);
        return this.schema_ids;
      });
    }
    return new Promise((resolve) => {
      resolve(this.schema_ids);
    });
  }

  static async getSchemaJSON(schemaId: string): Promise<any> {
    if (this.schema_map.has(schemaId)) {
      return new Promise((resolve) => {
        resolve(this.schema_map.get(schemaId));
      });
    } else {
      const config = await getKratosConfig();
      const publicAPI = new IdentityApi(config.publicConfig);
      const schemaResponse = await publicAPI.getIdentitySchema({
        id: schemaId,
      });
      this.extractSchemas([
        {
          schema: schemaResponse.data,
          id: schemaId,
        },
      ]);
      return this.schema_map.get(schemaId);
    }
  }

  static getSchemaFields(schema: any): SchemaField[] {
    if (schema === undefined || schema === null) {
      console.warn("getSchemaFields: schema is undefined");
      return [];
    }
    let array: SchemaField[] = [];

    array = array.concat(
      this.getSchemaFieldsInternal(schema.properties.traits, "trait"),
      this.getSchemaFieldsInternal(
        schema.properties.metadata_public,
        "metadata_public",
      ),
      this.getSchemaFieldsInternal(
        schema.properties.metadata_admin,
        "metadata_admin",
      ),
    );

    // set required flag
    if (schema.properties.traits.required) {
      const required = schema.properties.traits.required;
      for (const requiredField of required) {
        for (const elm of array) {
          if (elm.name === requiredField) {
            elm.required = true;
          }
        }
      }
    }

    return array;
  }

  private static getSchemaFieldsInternal(
    schema: any,
    fieldKind: FieldKind,
    parentName?: string,
  ): SchemaField[] {
    let array: SchemaField[] = [];
    if (schema === undefined) {
      return array;
    }

    const properties = schema.properties;
    for (const key of Object.keys(properties)) {
      if (properties[key].properties) {
        array = array.concat(
          this.getSchemaFieldsInternal(properties[key], fieldKind, key),
        );
      } else {
        const elem: SchemaField = {
          name: key,
          fieldKind: fieldKind,
          title: properties[key].title,
          parentName: parentName,
          required: false,
          type: properties[key].type,
          subType: properties[key].type,
          format: properties[key].format ? properties[key].format : "text",
        };

        if (elem.type === "array") {
          if (properties[key].items) {
            let item;
            if (
              Array.isArray(properties[key].items) &&
              properties[key].items.length > 0
            ) {
              item = properties[key].items[0];
            } else {
              item = properties[key].items;
            }
            elem.subType = item.type;
            elem.format = item.format || elem.format;
            elem.title = item.title || elem.title;
          }
        }

        array.push(elem);
      }
    }
    return array;
  }

  static async getSchemaFieldsFromIdentity(
    identity: Identity,
  ): Promise<SchemaField[]> {
    const schema = await this.getSchemaJSON(identity.schema_id);
    return this.getSchemaFields(schema);
  }

  static async getTableDetailListModelFromKratosIdentity(
    data: Identity,
  ): Promise<TableDetailListModel> {
    const array = await this.getTableDetailListModelFromKratosIdentities([
      data,
    ]);
    return array[0];
  }

  static async getTableDetailListModelFromKratosIdentities(
    data: Identity[],
  ): Promise<TableDetailListModel[]> {
    const typeList: TableDetailListModel[] = [];
    for (const element of data) {
      const type: TableDetailListModel = {
        key: element.id,
        state: element.state!,
        schema: element.schema_id,
        verifiable_addresses: element.verifiable_addresses
          ?.map((e) => e.value)
          .join(", ")!,
        traits: {},
        metadata_public: {},
        metadata_admin: {},
      };

      const fields = await this.getSchemaFieldsFromIdentity(element);

      for (const f of fields) {
        const fieldKindKey = mapFieldKindToPropertyKey(f.fieldKind);
        const elementFields = element[fieldKindKey] || {};
        if (f.parentName) {
          type[fieldKindKey][f.name] = elementFields[f.parentName]?.[f.name];
        } else {
          type[fieldKindKey][f.name] = elementFields[f.name];
        }
      }
      typeList.push(type);
    }
    return typeList;
  }

  private static extractSchemas(identitySchemas: IdentitySchemaContainer[]) {
    if (identitySchemas.length === 0) {
      this.schema_ids.push("default");
    }
    identitySchemas.forEach((schema) => {
      if (schema.schema) {
        if (this.schema_ids.indexOf(schema.id!) === -1) {
          this.schema_ids.push(schema.id!);
        }

        // since v0.11 the schema is base64 encoded
        //const parsedJSON = JSON.parse(window.atob(schema.schema + ""))
        //this.schema_map.set(schema.id!, parsedJSON)

        // since v0.13 the schema isnt base64 encoded anymore
        this.schema_map.set(schema.id!, schema.schema);
      }
    });
  }
}
