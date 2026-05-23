import type { SelectNode } from "../parser/AstNode";
import {
  formatColumns,
  formatWhere,
  type SqlDialect
} from "./SqlDialect";

export class PostgreSqlDialect implements SqlDialect {
  public name = "PostgreSQL";

  public generateIntermediateCode(ast: SelectNode): string {
    const columns = formatColumns(ast);
    const where = formatWhere(ast.whereCondition);

    return `SELECT ${columns} FROM ${ast.tableName}${where};`;
  }
}

export default PostgreSqlDialect;