interface AstViewerProps {
  ast: unknown | null;
}

const AstViewer = ({ ast }: AstViewerProps) => {
  if (!ast) {
    return (
      <section>
        <h2>Árbol de Sintaxis Abstracta</h2>
        <p>No hay AST para mostrar.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Árbol de Sintaxis Abstracta</h2>

      <pre
        style={{
          backgroundColor: "#111827",
          color: "#f9fafb",
          padding: "1rem",
          borderRadius: "0.5rem",
          overflowX: "auto",
          fontSize: "0.9rem"
        }}
      >
        {JSON.stringify(ast, null, 2)}
      </pre>
    </section>
  );
};

export default AstViewer;