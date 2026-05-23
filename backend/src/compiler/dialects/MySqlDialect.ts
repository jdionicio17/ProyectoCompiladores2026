import type { SelectNode } from "../parser/AstNode";
import {
  formatColumns,
  formatWhere,
  type SqlDialect
} from "./SqlDialect";

export class MySqlDialect implements SqlDialect {
  public name = "MySQL";

  public generateIntermediateCode(ast: SelectNode): string {
    const columns = formatColumns(ast);
    const where = formatWhere(ast.whereCondition);

    return `SELECT ${columns} FROM ${ast.tableName}${where};`;
  }
}

export default MySqlDialect;