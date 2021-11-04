import { Configuration } from "@ory/kratos-client";

export interface Config {
    kratosAdminURL: string;
    kratosPublicURL: string;
}

export const CONFIG: Config = {
    kratosAdminURL: isProd() ? process.env.REACT_APP_KRATOS_ADMIN_URL! : "http://127.0.0.1:4434",
    kratosPublicURL: isProd() ? process.env.REACT_APP_KRATOS_PUBLIC_URL! : "http://127.0.0.1:4433",
}

export const KRATOS_CONFIG: Configuration = new Configuration({ basePath: CONFIG.kratosPublicURL, baseOptions: { withCredentials: true } });

function isProd() {
    return process.env.NODE_ENV === "production"
}