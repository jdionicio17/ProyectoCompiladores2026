import type { CompileRequest, DatabaseDialect } from "../types/CompileRequest";
import type { CompileResponse } from "../types/CompileResponse";

const SUPPORTED_DIALECTS: DatabaseDialect[] = [
    "mysql",
    "postgresql",
    "sqlserver",
    "mongodb"
];

export class CompilerService {
    compile(request: CompileRequest): CompileResponse {
        const query = request.query.trim();
        const dialect = request.dialect;

        if (!query) {
            return {
                success: false,
                status: "INVALID",
                message: "El query SQL no puede estar vacío.",
                dialect,
                query,
                tokens: [],
                ast: null,
                symbolTable: null,
                intermediateCode: null,
                phases: [],
                errors: [
                    {
                        phase: "SYSTEM",
                        message: "No se recibió ninguna consulta SQL para compilar."
                    }
                ],
                warnings: []
            };
        }

        if (!SUPPORTED_DIALECTS.includes(dialect)) {
            return {
                success: false,
                status: "INVALID",
                message: `El dialecto "${dialect}" no está soportado.`,
                dialect,
                query,
                tokens: [],
                ast: null,
                symbolTable: null,
                intermediateCode: null,
                phases: [],
                errors: [
                    {
                        phase: "SYSTEM",
                        message: `Dialectos soportados: ${SUPPORTED_DIALECTS.join(", ")}.`
                    }
                ],
                warnings: []
            };
        }

        return {
            success: true,
            status: "PENDING",
            message:
                "API del compilador funcionando. Pendiente integrar Lexer, Parser y SemanticAnalyzer.",
            dialect,
            query,
            tokens: [],
            ast: null,
            symbolTable: this.getReferenceSchema(),
            intermediateCode: null,
            phases: [
                {
                    name: "LEXICAL",
                    status: "PENDING",
                    message: "Pendiente conectar backend/src/compiler/lexer/Lexer.ts."
                },
                {
                    name: "SYNTACTIC",
                    status: "PENDING",
                    message: "Pendiente conectar backend/src/compiler/parser/Parser.ts."
                },
                {
                    name: "SEMANTIC",
                    status: "PENDING",
                    message:
                        "Pendiente conectar backend/src/compiler/semantic/SemanticAnalyzer.ts."
                }
            ],
            errors: [],
            warnings: [
                "Esta respuesta confirma que la API ya funciona. La compilación real se integrará cuando estén listos Lexer, Parser y SemanticAnalyzer."
            ]
        };
    }

    private getReferenceSchema() {
        return {
            usuarios: {
                columns: {
                    id: "INT",
                    nombre: "VARCHAR",
                    edad: "INT",
                    ciudad: "VARCHAR"
                }
            },
            productos: {
                columns: {
                    id: "INT",
                    nombre: "VARCHAR",
                    precio: "FLOAT",
                    categoria: "VARCHAR"
                }
            }
        };
    }
}