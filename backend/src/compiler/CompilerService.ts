import { Lexer } from "./lexer/Lexer";
import { TokenType } from "./lexer/TokenType";
import { Parser, ParserError } from "./parser/Parser";
import { SymbolTable } from "./semantic/SymbolTable";
import { SemanticAnalyzer } from "./semantic/SemanticAnalyzer";
import { MySqlDialect } from "./dialects/MySqlDialect";
import { PostgreSqlDialect } from "./dialects/PostgreSqlDialect";
import { SqlServerDialect } from "./dialects/SqlServerDialect";
import { MongoDialect } from "./dialects/MongoDialect";
import type { SqlDialect } from "./dialects/SqlDialect";
import {
    CompilerErrorPhase,
    type CompilerError
} from "./errors/CompilerError";
import type { CompileRequest, DatabaseDialect } from "../types/CompileRequest";
import type {
    CompilationPhaseResponse,
    CompileResponse
} from "../types/CompileResponse";
import type { SelectNode } from "./parser/AstNode";

export class CompilerService {
    public compile(request: CompileRequest): CompileResponse {
        const query = request.query.trim();
        const dialect = request.dialect;

        if (!query) {
            return this.createInvalidResponse({
                query,
                dialect,
                message: "El query SQL no puede estar vacío.",
                errors: [
                    {
                        phase: CompilerErrorPhase.SYSTEM,
                        message: "Debe ingresar una consulta SQL para compilar."
                    }
                ]
            });
        }

        try {
            const phases: CompilationPhaseResponse[] = [];

            const lexer = new Lexer(query);
            const tokens = lexer.tokenize();

            const lexicalErrors = tokens
                .filter((token) => token.type === TokenType.INVALID)
                .map<CompilerError>((token) => ({
                    phase: CompilerErrorPhase.LEXICAL,
                    message: `Token inválido encontrado: "${token.value}".`,
                    line: token.line,
                    column: token.column
                }));

            if (lexicalErrors.length > 0) {
                phases.push({
                    name: "LEXICAL",
                    status: "ERROR",
                    message: "Se encontraron errores léxicos."
                });

                return {
                    success: false,
                    status: "INVALID",
                    message: "La consulta contiene errores léxicos.",
                    dialect,
                    query,
                    tokens,
                    ast: null,
                    symbolTable: null,
                    intermediateCode: null,
                    phases,
                    errors: lexicalErrors,
                    warnings: []
                };
            }

            phases.push({
                name: "LEXICAL",
                status: "SUCCESS",
                message: "Análisis léxico completado correctamente."
            });

            let ast: SelectNode;

            try {
                const parser = new Parser(tokens);
                ast = parser.parse();

                phases.push({
                    name: "SYNTACTIC",
                    status: "SUCCESS",
                    message: "Análisis sintáctico completado correctamente."
                });
            } catch (error) {
                const syntacticError = this.mapParserError(error);

                phases.push({
                    name: "SYNTACTIC",
                    status: "ERROR",
                    message: "Se encontraron errores sintácticos."
                });

                return {
                    success: false,
                    status: "INVALID",
                    message: "La consulta contiene errores sintácticos.",
                    dialect,
                    query,
                    tokens,
                    ast: null,
                    symbolTable: null,
                    intermediateCode: null,
                    phases,
                    errors: [syntacticError],
                    warnings: []
                };
            }

            const symbolTable = new SymbolTable();
            const semanticAnalyzer = new SemanticAnalyzer(symbolTable);
            const semanticResult = semanticAnalyzer.analyze(ast);

            if (!semanticResult.valid) {
                phases.push({
                    name: "SEMANTIC",
                    status: "ERROR",
                    message: "Se encontraron errores semánticos."
                });

                return {
                    success: false,
                    status: "INVALID",
                    message: "La consulta contiene errores semánticos.",
                    dialect,
                    query,
                    tokens,
                    ast,
                    symbolTable: symbolTable.toJSON(),
                    intermediateCode: null,
                    phases,
                    errors: semanticResult.errors,
                    warnings: semanticResult.warnings
                };
            }

            phases.push({
                name: "SEMANTIC",
                status: "SUCCESS",
                message: "Análisis semántico completado correctamente."
            });

            const selectedDialect = this.getDialect(dialect);
            const intermediateCode = selectedDialect.generateIntermediateCode(ast);

            return {
                success: true,
                status: "VALID",
                message: "La consulta SQL es válida.",
                dialect,
                query,
                tokens,
                ast,
                symbolTable: symbolTable.toJSON(),
                intermediateCode,
                phases,
                errors: [],
                warnings: semanticResult.warnings
            };
        } catch (error) {
            return this.createInvalidResponse({
                query,
                dialect,
                message: "Error interno durante la compilación.",
                errors: [
                    {
                        phase: CompilerErrorPhase.SYSTEM,
                        message:
                            error instanceof Error
                                ? error.message
                                : "Error desconocido durante la compilación."
                    }
                ]
            });
        }
    }

    private getDialect(dialect: DatabaseDialect): SqlDialect {
        switch (dialect) {
            case "mysql":
                return new MySqlDialect();

            case "postgresql":
                return new PostgreSqlDialect();

            case "sqlserver":
                return new SqlServerDialect();

            case "mongodb":
                return new MongoDialect();

            default:
                return new MySqlDialect();
        }
    }

    private mapParserError(error: unknown): CompilerError {
        if (error instanceof ParserError) {
            return {
                phase: CompilerErrorPhase.SYNTACTIC,
                message: error.message,
                line: error.line,
                column: error.column
            };
        }

        return {
            phase: CompilerErrorPhase.SYNTACTIC,
            message:
                error instanceof Error
                    ? error.message
                    : "Error sintáctico desconocido."
        };
    }

    private createInvalidResponse(params: {
        query: string;
        dialect: DatabaseDialect;
        message: string;
        errors: CompilerError[];
    }): CompileResponse {
        return {
            success: false,
            status: "INVALID",
            message: params.message,
            dialect: params.dialect,
            query: params.query,
            tokens: [],
            ast: null,
            symbolTable: null,
            intermediateCode: null,
            phases: [],
            errors: params.errors,
            warnings: []
        };
    }
}

export default CompilerService;