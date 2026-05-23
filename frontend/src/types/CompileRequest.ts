export type DatabaseDialect = "mysql" | "postgresql" | "sqlserver" | "mongodb";

export interface CompileRequest {
    query: string;
    dialect: DatabaseDialect;
}