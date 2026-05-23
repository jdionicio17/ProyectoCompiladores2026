export const DataType = {
  INT: "INT",
  VARCHAR: "VARCHAR",
  FLOAT: "FLOAT",
  UNKNOWN: "UNKNOWN"
} as const;

export type DataType = (typeof DataType)[keyof typeof DataType];

export interface Column {
  name: string;
  type: DataType;
}

export interface Table {
  name: string;
  columns: Column[];
}

export class SymbolTable {
  private tables: Table[];

  constructor() {
    this.tables = [
      {
        name: "usuarios",
        columns: [
          { name: "id", type: DataType.INT },
          { name: "nombre", type: DataType.VARCHAR },
          { name: "edad", type: DataType.INT },
          { name: "ciudad", type: DataType.VARCHAR }
        ]
      },
      {
        name: "productos",
        columns: [
          { name: "id", type: DataType.INT },
          { name: "nombre", type: DataType.VARCHAR },
          { name: "precio", type: DataType.FLOAT },
          { name: "categoria", type: DataType.VARCHAR }
        ]
      }
    ];
  }

  public findTable(tableName: string): Table | null {
    const normalizedTableName = tableName.toLowerCase();

    return (
      this.tables.find(
        (table) => table.name.toLowerCase() === normalizedTableName
      ) ?? null
    );
  }

  public findColumn(table: Table, columnName: string): Column | null {
    const normalizedColumnName = columnName.toLowerCase();

    return (
      table.columns.find(
        (column) => column.name.toLowerCase() === normalizedColumnName
      ) ?? null
    );
  }

  public getTables(): Table[] {
    return this.tables;
  }

  public toJSON() {
    return this.tables.map((table) => ({
      name: table.name,
      columns: table.columns
    }));
  }
}

export default SymbolTable;