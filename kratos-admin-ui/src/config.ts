import { Configuration } from "@ory/kratos-client";

export interface KratosAdminConfig {
  kratosAdminURL: string;
  kratosPublicURL: string;
  version: string;
  supportedVersion: string;
  reverseProxy: boolean;
}

export interface KratosConfig {
  adminConfig: Configuration;
  publicConfig: Configuration;
}

interface JSONConfig {
  kratosAdminURL?: string;
  kratosPublicURL?: string;
  reverseProxy?: boolean;
}

let JSON_CONFIG: JSONConfig = {};

async function loadConfig() {
  if (!JSON_CONFIG.kratosAdminURL) {
    const data = await fetch("/config.json");
    JSON_CONFIG = (await data.json()) as JSONConfig;
    if (JSON_CONFIG.reverseProxy) {
      // every admin-url starts with /admin, so there is no need to have /admin/admin. There is a url rewrite in the nginx config
      JSON_CONFIG.kratosAdminURL = "/api";
      JSON_CONFIG.kratosPublicURL = "/api/public";
    }
  }
  return JSON_CONFIG;
}

export async function getKratosConfig() {
  const configJSON = await loadConfig();
  return {
    adminConfig: new Configuration({
      basePath: configJSON.kratosAdminURL,
      baseOptions: { withCredentials: true },
    }),
    publicConfig: new Configuration({
      basePath: configJSON.kratosPublicURL,
      baseOptions: { withCredentials: true },
    }),
  } as KratosConfig;
}

export async function getKratosAdminConfig() {
  const configJSON = await loadConfig();
  return {
    version: "2.5.0",
    supportedVersion: "v1.3.1",
    kratosAdminURL: configJSON.kratosAdminURL,
    kratosPublicURL: configJSON.kratosPublicURL,
    reverseProxy: configJSON.reverseProxy,
  } as KratosAdminConfig;
}
