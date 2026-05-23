import {
  CompOperator,
  ExpressionType,
  type ConditionNode,
  type ExpressionNode,
  type SelectNode
} from "../parser/AstNode";
import {
  CompilerErrorPhase,
  type CompilerError
} from "../errors/CompilerError";
import ErrorManager from "../errors/ErrorManager";
import { DataType, SymbolTable, type Table } from "./SymbolTable";

export interface SemanticAnalysisResult {
  valid: boolean;
  errors: CompilerError[];
  warnings: string[];
}

export class SemanticAnalyzer {
  private symbolTable: SymbolTable;
  private errorManager: ErrorManager;

  constructor(symbolTable: SymbolTable) {
    this.symbolTable = symbolTable;
    this.errorManager = new ErrorManager();
  }

  public analyze(ast: SelectNode | null): SemanticAnalysisResult {
    this.errorManager.clear();

    if (!ast) {
      this.errorManager.addError(
        CompilerErrorPhase.SEMANTIC,
        "El AST recibido está vacío."
      );

      return this.buildResult();
    }

    const table = this.validateTable(ast.tableName);

    if (!table) {
      return this.buildResult();
    }

    this.validateColumns(ast, table);

    if (ast.whereCondition) {
      this.validateCondition(ast.whereCondition, table);
    }

    return this.buildResult();
  }

  private validateTable(tableName: string): Table | null {
    const table = this.symbolTable.findTable(tableName);

    if (!table) {
      this.errorManager.addSemanticError(
        `La tabla "${tableName}" no existe en el esquema.`
      );
      return null;
    }

    return table;
  }

  private validateColumns(ast: SelectNode, table: Table): void {
    if (ast.selectAll) {
      return;
    }

    for (const columnName of ast.columns) {
      const column = this.symbolTable.findColumn(table, columnName);

      if (!column) {
        this.errorManager.addSemanticError(
          `La columna "${columnName}" no existe en la tabla "${table.name}".`
        );
      }
    }
  }

  private validateCondition(condition: ConditionNode, table: Table): void {
    const leftType = this.getExpressionType(condition.left, table);
    const rightType = this.getExpressionType(condition.right, table);

    if (!this.areTypesCompatible(leftType, rightType, condition.operator)) {
      this.errorManager.addSemanticError(
        `Tipos incompatibles en comparación: ${leftType} ${condition.operator} ${rightType}.`
      );
    }
  }

  private getExpressionType(expression: ExpressionNode, table: Table): DataType {
    if (expression.expressionType === ExpressionType.NUMBER) {
      return expression.value.includes(".") ? DataType.FLOAT : DataType.INT;
    }

    if (expression.expressionType === ExpressionType.STRING) {
      return DataType.VARCHAR;
    }

    if (expression.expressionType === ExpressionType.IDENTIFIER) {
      const column = this.symbolTable.findColumn(table, expression.value);

      if (!column) {
        this.errorManager.addSemanticError(
          `La columna "${expression.value}" no existe en la tabla "${table.name}".`
        );

        return DataType.UNKNOWN;
      }

      return column.type;
    }

    return DataType.UNKNOWN;
  }

  private areTypesCompatible(
  left: DataType,
  right: DataType,
  operator: CompOperator
): boolean {
  if (left === DataType.UNKNOWN || right === DataType.UNKNOWN) {
    return false;
  }

  if (left === right) {
    return true;
  }

  const isLeftNumeric = left === DataType.INT || left === DataType.FLOAT;
  const isRightNumeric = right === DataType.INT || right === DataType.FLOAT;

  if (isLeftNumeric && isRightNumeric) {
    return true;
  }

  if (
    operator === CompOperator.EQUAL ||
    operator === CompOperator.NOT_EQUAL
  ) {
    return left === right;
  }

  return false;
}

  private buildResult(): SemanticAnalysisResult {
    return {
      valid: !this.errorManager.hasErrors(),
      errors: this.errorManager.getErrors(),
      warnings: this.errorManager.getWarnings()
    };
  }
}

export default SemanticAnalyzer;