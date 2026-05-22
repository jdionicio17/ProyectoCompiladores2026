export const ExpressionType = {
  IDENTIFIER: "IDENTIFIER",
  NUMBER: "NUMBER",
  STRING: "STRING"
} as const;

export type ExpressionType =
  (typeof ExpressionType)[keyof typeof ExpressionType];

export const CompOperator = {
  EQUAL: "=",
  GREATER: ">",
  LESS: "<",
  GREATER_EQUAL: ">=",
  LESS_EQUAL: "<=",
  NOT_EQUAL: "!="
} as const;

export type CompOperator =
  (typeof CompOperator)[keyof typeof CompOperator];

export interface AstNode {
  nodeType: string;
}

export interface ExpressionNode extends AstNode {
  nodeType: "EXPRESSION";
  expressionType: ExpressionType;
  value: string;
}

export interface ConditionNode extends AstNode {
  nodeType: "CONDITION";
  left: ExpressionNode;
  operator: CompOperator;
  right: ExpressionNode;
}

export interface SelectNode extends AstNode {
  nodeType: "SELECT";
  selectAll: boolean;
  columns: string[];
  tableName: string;
  whereCondition: ConditionNode | null;
}

export type QueryNode = SelectNode;

export const createExpressionNode = (
  expressionType: ExpressionType,
  value: string
): ExpressionNode => {
  return {
    nodeType: "EXPRESSION",
    expressionType,
    value
  };
};

export const createConditionNode = (
  left: ExpressionNode,
  operator: CompOperator,
  right: ExpressionNode
): ConditionNode => {
  return {
    nodeType: "CONDITION",
    left,
    operator,
    right
  };
};

export const createSelectNode = (): SelectNode => {
  return {
    nodeType: "SELECT",
    selectAll: false,
    columns: [],
    tableName: "",
    whereCondition: null
  };
};