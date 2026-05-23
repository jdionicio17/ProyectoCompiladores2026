interface CompilerError {
  phase: string;
  message: string;
  line?: number;
  column?: number;
}

interface ErrorListProps {
  errors: CompilerError[];
}

const ErrorList = ({ errors }: ErrorListProps) => {
  if (!errors || errors.length === 0) {
    return (
      <section>
        <h2>Errores</h2>
        <p>No se encontraron errores.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Errores</h2>

      <ul>
        {errors.map((error, index) => (
          <li key={`${error.phase}-${error.message}-${index}`}>
            <strong>{error.phase}:</strong> {error.message}
            {error.line && error.column ? (
              <span>
                {" "}
                Línea {error.line}, columna {error.column}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ErrorList;