interface QueryEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const QueryEditor = ({ value, onChange }: QueryEditorProps) => {
    return (
        <section>
            <label htmlFor="query-editor">
                <strong>Consulta SQL</strong>
            </label>

            <textarea
                id="query-editor"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder="Ejemplo: SELECT nombre FROM usuarios WHERE edad > 18;"
                rows={8}
                style={{
                    width: "100%",
                    marginTop: "0.5rem",
                    padding: "1rem",
                    fontFamily: "Consolas, monospace",
                    fontSize: "1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid #d1d5db",
                    resize: "vertical"
                }}
            />
        </section>
    );
};

export default QueryEditor;