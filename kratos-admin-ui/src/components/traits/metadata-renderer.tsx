import { MultilineEdit } from "../multiline/multiline"
import { Text } from "@fluentui/react-components"
import { MetaData } from "./edit-traits"
import { useEffect } from "react";

interface MetadataRendererProps {
    publicMetadata?: MetaData;
    adminMetadata?: MetaData;
}

export function MetadataRenderer(props: MetadataRendererProps) {

    useEffect(()=> {
        
    }, [])

    return <>
        <div>
            <Text
                as="h3"
                style={{
                    display: "block",
                    marginTop: 10,
                    marginBottom: 2
                }}
            >Public Metadata</Text>
            <MultilineEdit
                datatype="text"
                dataChanged={(data) => {
                    console.log({ data })
                }}
                name="public_metadata"
                defaultData={[]}
            ></MultilineEdit>
        </div>

        <div>
            <Text
                as="h3"
                style={{
                    display: "block",
                    marginTop: 10,
                    marginBottom: 2
                }}
            >Admin Metadata</Text>
            <MultilineEdit
                datatype="text"
                dataChanged={(data) => {
                    console.log({ data })
                }}
                name="admin_metadata"
                defaultData={[]}
            ></MultilineEdit>
        </div>
    </>
}