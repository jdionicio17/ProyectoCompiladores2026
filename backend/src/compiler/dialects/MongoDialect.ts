import type { ConditionNode, ExpressionNode, SelectNode } from "../parser/AstNode";
import { CompOperator, ExpressionType } from "../parser/AstNode";
import type { SqlDialect } from "./SqlDialect";

export class MongoDialect implements SqlDialect {
  public name = "MongoDB";

  public generateIntermediateCode(ast: SelectNode): string {
    const filter = this.buildFilter(ast.whereCondition);
    const projection = this.buildProjection(ast);

    return `db.${ast.tableName}.find(${filter}, ${projection});`;
  }

  private buildProjection(ast: SelectNode): string {
    if (ast.selectAll) {
      return "{}";
    }

    const projectionFields = ast.columns
      .map((column) => `"${column}": 1`)
      .join(", ");

    return `{ ${projectionFields} }`;
  }

  private buildFilter(condition: ConditionNode | null): string {
    if (!condition) {
      return "{}";
    }

    if (condition.left.expressionType !== ExpressionType.IDENTIFIER) {
      return "{}";
    }

    const field = condition.left.value;
    const value = this.formatMongoValue(condition.right);

    switch (condition.operator) {
      case CompOperator.EQUAL:
        return `{ "${field}": ${value} }`;

      case CompOperator.NOT_EQUAL:
        return `{ "${field}": { "$ne": ${value} } }`;

      case CompOperator.GREATER:
        return `{ "${field}": { "$gt": ${value} } }`;

      case CompOperator.LESS:
        return `{ "${field}": { "$lt": ${value} } }`;

      case CompOperator.GREATER_EQUAL:
        return `{ "${field}": { "$gte": ${value} } }`;

      case CompOperator.LESS_EQUAL:
        return `{ "${field}": { "$lte": ${value} } }`;

      default:
        return "{}";
    }
  }

  private formatMongoValue(expression: ExpressionNode): string {
    if (expression.expressionType === ExpressionType.NUMBER) {
      return expression.value;
    }

    return `"${expression.value}"`;
  }
}

export default MongoDialect;