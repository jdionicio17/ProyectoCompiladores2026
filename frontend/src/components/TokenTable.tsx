import type { Token } from "../types/Token";

interface TokenTableProps {
  tokens: Token[];
}

const TokenTable = ({ tokens }: TokenTableProps) => {
  if (!tokens || tokens.length === 0) {
    return (
      <section>
        <h2>Tokens generados</h2>
        <p>No hay tokens para mostrar.</p>
      </section>
    );
  }

  return (
    <section>
      <h2>Tokens generados</h2>

      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Línea</th>
              <th>Columna</th>
            </tr>
          </thead>

          <tbody>
            {tokens.map((token, index) => (
              <tr
                key={`${token.type}-${token.value}-${token.line}-${token.column}-${index}`}
              >
                <td>{index + 1}</td>
                <td>{token.type}</td>
                <td>{token.value || "-"}</td>
                <td>{token.line}</td>
                <td>{token.column}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TokenTable;