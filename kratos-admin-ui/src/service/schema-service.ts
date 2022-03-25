import { IObjectWithKey } from "@fluentui/react";
import { Identity, V0alpha2Api } from "@ory/kratos-client";
import { KRATOS_ADMIN_CONFIG, KRATOS_PUBLIC_CONFIG } from "../config";

export interface SchemaField {
    name: string;
    title: string;
    parentName?: string;
}

export interface DetailListModel extends IObjectWithKey {
    key: string
}

export class SchemaService {

    private static schema_ids: string[] = [];
    private static schema_map: Map<string, any> = new Map<string, any>();
    private static adminAPI = new V0alpha2Api(KRATOS_ADMIN_CONFIG);
    private static publicAPI = new V0alpha2Api(KRATOS_PUBLIC_CONFIG);

    static getSchemaIDs(): Promise<string[]> {
        if (this.schema_ids.length === 0) {
            return SchemaService.adminAPI.adminListIdentities().then(data => {
                this.extractSchemas(data.data)
                return this.schema_ids;
            })
        }
        return new Promise(resolve => {
            resolve(this.schema_ids);
        })
    }

    static getSchemaJSON(schema: string): Promise<any> {
        if (this.schema_map.has(schema)) {
            return new Promise(resolve => {
                resolve(this.schema_map.get(schema))
            })
        } else {
            return this.publicAPI.getJsonSchema(schema).then(data => {
                this.schema_map.set(schema, data.data);
                return this.schema_map.get(schema)
            })
        }
    }

    static getSchemaFields(schema: object): SchemaField[] {
        const schemaObj = schema as any;
        const properties = schemaObj.properties.traits;
        let array: SchemaField[] = [];

        array = array.concat(this.getSchemaFieldsInternal(properties))

        return array;
    }

    static getSchemaFieldsInternal(schema: any, parentName?: string): SchemaField[] {
        let array: SchemaField[] = [];

        const properties = schema.properties;
        for (const key of Object.keys(properties)) {
            if (properties[key].properties) {
                array = array.concat(this.getSchemaFieldsInternal(properties[key], key))
            } else {
                array.push({
                    name: key,
                    title: properties[key].title,
                    parentName: parentName
                });
            }
        }

        return array;
    }

    static mapKratosIdentity(data: Identity, fields: SchemaField[]): DetailListModel {
        return this.mapKratosIdentites([data], fields)[0];
    }

    static mapKratosIdentites(data: Identity[], fields: SchemaField[]): DetailListModel[] {
        return data.map(element => {
            const traits: any = element.traits;
            const type: any = { key: element.id };

            fields.forEach(f => {
                if (f.parentName) {
                    type[f.name] = traits[f.parentName][f.name]
                } else {
                    type[f.name] = traits[f.name]
                }
            })

            return type;
        })
    }

    static extractSchemas(identites: Identity[]) {
        if (identites.length === 0) {
            this.addSchemaIfNotExists("default")
        }
        identites.forEach(identity => {
            this.addSchemaIfNotExists(identity.schema_id);
        });
    }

    private static addSchemaIfNotExists(schemaName: string) {
        if (this.schema_ids.indexOf(schemaName) === -1) {
            this.schema_ids.push(schemaName);
        }
    }

}