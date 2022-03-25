import { Identity, V0alpha2Api } from "@ory/kratos-client";
import { KRATOS_ADMIN_CONFIG } from "../config";

export interface SchemaField {
    name: string;
    title: string;
}

export class SchemaService {

    private static schema_ids: string[] = [];
    private static api = new V0alpha2Api(KRATOS_ADMIN_CONFIG);

    static getSchemaIDs(): Promise<string[]> {
        if (this.schema_ids.length === 0) {
            return SchemaService.api.adminListIdentities().then(data => {
                this.extractSchemas(data.data)
                return this.schema_ids;
            })
        }
        return new Promise(resolve => {
            resolve(this.schema_ids);
        })
    }

    static getSchemaFields(schema: object): SchemaField[] {
        const schemaObj = schema as any;
        const properties = schemaObj.properties.traits;
        let array: SchemaField[] = [];

        array = array.concat(this.getSchemaFieldsInternal(properties))

        return array;
    }

    static getSchemaFieldsInternal(schema: any): SchemaField[] {
        let array: SchemaField[] = [];

        const properties = schema.properties;
        for (const key of Object.keys(properties)) {
            if (properties[key].properties) {
                array = array.concat(this.getSchemaFieldsInternal(properties[key]))
            } else {
                array.push({
                    name: key,
                    title: properties[key].title
                });
            }
        }

        return array;
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