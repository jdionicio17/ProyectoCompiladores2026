export type DatabaseDialect = "mysql" | "postgresql" | "sqlserver" | "mongodb";

interface DialectSelectorProps {
  value: DatabaseDialect;
  onChange: (dialect: DatabaseDialect) => void;
}

const DialectSelector = ({ value, onChange }: DialectSelectorProps) => {
  return (
    <section>
      <label htmlFor="dialect">
        <strong>Motor de base de datos</strong>
      </label>

      <select
        id="dialect"
        value={value}
        onChange={(event) => onChange(event.target.value as DatabaseDialect)}
      >
        <option value="mysql">MySQL</option>
        <option value="postgresql">PostgreSQL</option>
        <option value="sqlserver">SQL Server</option>
        <option value="mongodb">MongoDB</option>
      </select>
    </section>
  );
};

export default DialectSelector;