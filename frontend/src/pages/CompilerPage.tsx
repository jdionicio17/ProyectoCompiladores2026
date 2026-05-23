import { useState } from "react";
import QueryEditor from "../components/QueryEditor";
import DialectSelector from "../components/DialectSelector";
import ResultPanel from "../components/ResultPanel";
import TokenTable from "../components/TokenTable";
import AstViewer from "../components/AstViewer";
import ErrorList from "../components/ErrorList";
import { compileQuery } from "../services/compilerApi";
import type { CompileResponse } from "../types/CompileResponse";
import type { DatabaseDialect } from "../types/CompileRequest";

const DEFAULT_QUERY = "SELECT nombre FROM usuarios WHERE edad > 18;";

const CompilerPage = () => {
    const [query, setQuery] = useState(DEFAULT_QUERY);
    const [dialect, setDialect] = useState<DatabaseDialect>("mysql");
    const [result, setResult] = useState<CompileResponse | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCompile = async () => {
        try {
            setLoading(true);

            const response = await compileQuery({
                query,
                dialect
            });

            setResult(response);
        } catch (error) {
            setResult({
                success: false,
                status: "INVALID",
                message: "No se pudo conectar con el backend.",
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
                        message:
                            error instanceof Error
                                ? error.message
                                : "Error desconocido al conectar con el backend."
                    }
                ],
                warnings: []
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main
            style={{
                maxWidth: "1100px",
                margin: "0 auto",
                padding: "2rem"
            }}
        >
            <header style={{ marginBottom: "2rem" }}>
                <h1>Compilador SQL Web</h1>
                <p>
                    Proyecto de Compiladores: análisis léxico, sintáctico y semántico de
                    consultas SQL.
                </p>
            </header>

            <div
                style={{
                    display: "grid",
                    gap: "1.5rem"
                }}
            >
                <QueryEditor value={query} onChange={setQuery} />

                <DialectSelector value={dialect} onChange={setDialect} />

                <button
                    type="button"
                    onClick={handleCompile}
                    disabled={loading}
                    style={{
                        padding: "0.8rem 1.2rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        fontWeight: "bold"
                    }}
                >
                    {loading ? "Compilando..." : "Compilar consulta"}
                </button>

                <ResultPanel result={result} loading={loading} />

                <ErrorList errors={result?.errors ?? []} />

                <TokenTable tokens={result?.tokens ?? []} />

                <AstViewer ast={result?.ast ?? null} />
            </div>
        </main>
    );
};

export default CompilerPage;