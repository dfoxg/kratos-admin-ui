import { Configuration } from "@ory/kratos-client";

export interface KratosAdminConfig {
    kratosAdminURL: string;
    kratosPublicURL: string;
    version: string;
    supportedVersion: string;
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
        JSON_CONFIG = await data.json() as JSONConfig;
    }
    return JSON_CONFIG
}

export async function getKratosConfig() {
    const urls = await loadConfig()
    return {
        adminConfig: new Configuration({ basePath: urls.kratosAdminURL, baseOptions: { withCredentials: true } }),
        publicConfig: new Configuration({ basePath: urls.kratosPublicURL, baseOptions: { withCredentials: true } })
    } as KratosConfig
}

export async function getKratosAdminConfig() {
    const urls = await loadConfig()
    return {
        version: "1.0.4",
        supportedVersion: "v0.11.0",
        kratosAdminURL: urls.kratosAdminURL,
        kratosPublicURL: urls.kratosPublicURL
    } as KratosAdminConfig
}