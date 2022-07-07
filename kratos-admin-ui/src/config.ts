import { Configuration } from "@ory/kratos-client";

export interface KratosAdminConfig {
    kratosAdminURL: string;
    kratosPublicURL: string;
    version: string;
}

export interface KratosConfig {
    adminConfig: Configuration,
    publicConfig: Configuration,
}

interface JSONConfig {
    kratosAdminURL?: string;
    kratosPublicURL?: string;
}

let JSON_CONFIG: JSONConfig = {}

async function loadConfig() {
    if (!JSON_CONFIG.kratosAdminURL) {
        const data = await fetch("/config.json")
        JSON_CONFIG = await <JSONConfig>data.json();
    }
    return JSON_CONFIG
}

export async function getKratosConfig() {
    const urls = await loadConfig()
    return <KratosConfig>{
        adminConfig: new Configuration({ basePath: urls.kratosAdminURL, baseOptions: { withCredentials: true } }),
        publicConfig: new Configuration({ basePath: urls.kratosPublicURL, baseOptions: { withCredentials: true } })
    }
}

export async function getKratosAdminConfig() {
    const urls = await loadConfig()
    return <KratosAdminConfig>{
        version: "1.0.0",
        kratosAdminURL: urls.kratosAdminURL,
        kratosPublicURL: urls.kratosPublicURL
    }
}