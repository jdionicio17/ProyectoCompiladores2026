import type { CompileResponse } from "../types/CompileResponse";

interface ResultPanelProps {
    result: CompileResponse | null;
    loading: boolean;
}

const ResultPanel = ({ result, loading }: ResultPanelProps) => {
    if (loading) {
        return (
            <section>
                <h2>Resultado</h2>
                <p>Compilando consulta...</p>
            </section>
        );
    }

    if (!result) {
        return (
            <section>
                <h2>Resultado</h2>
                <p>Aún no se ha compilado ninguna consulta.</p>
            </section>
        );
    }

    return (
        <section>
            <h2>Resultado</h2>

            <div
                style={{
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    backgroundColor: result.success ? "#ecfdf5" : "#fef2f2"
                }}
            >
                <p>
                    <strong>Estado:</strong> {result.status}
                </p>

                <p>
                    <strong>Mensaje:</strong> {result.message}
                </p>

                <p>
                    <strong>Dialect:</strong> {result.dialect}
                </p>

                {result.intermediateCode ? (
                    <div>
                        <strong>Código intermedio / equivalente:</strong>
                        <pre
                            style={{
                                backgroundColor: "#111827",
                                color: "#f9fafb",
                                padding: "1rem",
                                borderRadius: "0.5rem",
                                overflowX: "auto"
                            }}
                        >
                            {result.intermediateCode}
                        </pre>
                    </div>
                ) : null}

                {result.phases.length > 0 ? (
                    <div>
                        <strong>Fases:</strong>

                        <ul>
                            {result.phases.map((phase) => (
                                <li key={phase.name}>
                                    {phase.name}: {phase.status} — {phase.message}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}

                {result.warnings.length > 0 ? (
                    <div>
                        <strong>Advertencias:</strong>

                        <ul>
                            {result.warnings.map((warning, index) => (
                                <li key={`${warning}-${index}`}>{warning}</li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </div>
        </section>
    );
};

export default ResultPanel;