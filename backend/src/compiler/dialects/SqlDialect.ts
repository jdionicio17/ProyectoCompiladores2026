import type { SelectNode, ConditionNode, ExpressionNode } from "../parser/AstNode";

export interface SqlDialect {
  name: string;
  generateIntermediateCode(ast: SelectNode): string;
}

export const formatColumns = (ast: SelectNode): string => {
  if (ast.selectAll) {
    return "*";
  }

  return ast.columns.join(", ");
};

export const formatExpression = (expression: ExpressionNode): string => {
  if (expression.expressionType === "STRING") {
    return `'${expression.value}'`;
  }

  return expression.value;
};

export const formatWhere = (condition: ConditionNode | null): string => {
  if (!condition) {
    return "";
  }

  return ` WHERE ${formatExpression(condition.left)} ${condition.operator} ${formatExpression(
    condition.right
  )}`;
};