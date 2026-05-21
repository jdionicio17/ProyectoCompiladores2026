import type { DatabaseDialect } from "./CompileRequest";

export type CompileStatus = "VALID" | "INVALID" | "PENDING";

export interface TokenResponse {
    type: string;
    value: string;
    line: number;
    column: number;
}

export interface CompilerErrorResponse {
    phase: "LEXICAL" | "SYNTACTIC" | "SEMANTIC" | "SYSTEM";
    message: string;
    line?: number;
    column?: number;
}

export interface CompilationPhaseResponse {
    name: "LEXICAL" | "SYNTACTIC" | "SEMANTIC";
    status: "SUCCESS" | "ERROR" | "PENDING";
    message: string;
}

export interface CompileResponse {
    success: boolean;
    status: CompileStatus;
    message: string;
    dialect: DatabaseDialect;
    query: string;
    tokens: TokenResponse[];
    ast: unknown | null;
    symbolTable: unknown | null;
    intermediateCode: string | null;
    phases: CompilationPhaseResponse[];
    errors: CompilerErrorResponse[];
    warnings: string[];
}