import { TokenType, type TokenType as TokenTypeValue } from "../lexer/TokenType";
import type { Token } from "../lexer/Token";
import {
  CompOperator,
  createConditionNode,
  createExpressionNode,
  createSelectNode,
  ExpressionType,
  type ConditionNode,
  type ExpressionNode,
  type SelectNode
} from "./AstNode";

export class ParserError extends Error {
  public line: number;
  public column: number;

  constructor(message: string, line: number, column: number) {
    super(`Error de sintaxis en línea ${line}, columna ${column}: ${message}`);
    this.name = "ParserError";
    this.line = line;
    this.column = column;
  }
}

export class Parser {
  private tokens: Token[];
  private position: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
  }

  public parse(): SelectNode {
    return this.parseQuery();
  }

  private parseQuery(): SelectNode {
    const selectNode = createSelectNode();

    this.expect(TokenType.SELECT, "Se esperaba la palabra clave SELECT.");

    this.parseColumns(selectNode);

    this.expect(TokenType.FROM, "Se esperaba la palabra clave FROM.");

    const tableToken = this.expect(
      TokenType.IDENTIFIER,
      "Se esperaba el nombre de la tabla después de FROM."
    );

    selectNode.tableName = tableToken.value;

    if (this.check(TokenType.WHERE)) {
      selectNode.whereCondition = this.parseWhere();
    }

    if (this.check(TokenType.SEMICOLON)) {
      this.advance();
    }

    this.expect(
      TokenType.END_OF_FILE,
      "Se esperaba fin de consulta después de la sentencia SQL."
    );

    return selectNode;
  }

  private parseColumns(selectNode: SelectNode): void {
    if (this.check(TokenType.ASTERISK)) {
      selectNode.selectAll = true;
      this.advance();
      return;
    }

    if (!this.check(TokenType.IDENTIFIER)) {
      this.error("Se esperaba '*' o una lista de columnas.");
    }

    const firstColumn = this.expect(
      TokenType.IDENTIFIER,
      "Se esperaba el nombre de una columna."
    );

    selectNode.columns.push(firstColumn.value);

    while (this.check(TokenType.COMMA)) {
      this.advance();

      const columnToken = this.expect(
        TokenType.IDENTIFIER,
        "Se esperaba el nombre de una columna después de la coma."
      );

      selectNode.columns.push(columnToken.value);
    }
  }

  private parseWhere(): ConditionNode {
    this.expect(TokenType.WHERE, "Se esperaba la palabra clave WHERE.");
    return this.parseCondition();
  }

  private parseCondition(): ConditionNode {
    const left = this.parseExpression();

    if (!this.isComparisonOperator(this.current().type)) {
      this.error("Se esperaba un operador de comparación: =, >, <, >=, <=, != o <>.");
    }

    const operator = this.tokenTypeToCompOperator(this.current().type);
    this.advance();

    const right = this.parseExpression();

    return createConditionNode(left, operator, right);
  }

  private parseExpression(): ExpressionNode {
    const token = this.current();

    if (this.check(TokenType.IDENTIFIER)) {
      this.advance();
      return createExpressionNode(ExpressionType.IDENTIFIER, token.value);
    }

    if (this.check(TokenType.NUMBER)) {
      this.advance();
      return createExpressionNode(ExpressionType.NUMBER, token.value);
    }

    if (this.check(TokenType.STRING)) {
      this.advance();
      return createExpressionNode(ExpressionType.STRING, token.value);
    }

    this.error("Se esperaba una expresión: identificador, número o string.");
  }

  private tokenTypeToCompOperator(type: TokenTypeValue): CompOperator {
    switch (type) {
      case TokenType.EQUAL:
        return CompOperator.EQUAL;

      case TokenType.GREATER:
        return CompOperator.GREATER;

      case TokenType.LESS:
        return CompOperator.LESS;

      case TokenType.GREATER_EQUAL:
        return CompOperator.GREATER_EQUAL;

      case TokenType.LESS_EQUAL:
        return CompOperator.LESS_EQUAL;

      case TokenType.NOT_EQUAL:
        return CompOperator.NOT_EQUAL;

      default:
        this.error("Operador de comparación inválido.");
    }
  }

  private isComparisonOperator(type: TokenTypeValue): boolean {
    return (
      type === TokenType.EQUAL ||
      type === TokenType.GREATER ||
      type === TokenType.LESS ||
      type === TokenType.GREATER_EQUAL ||
      type === TokenType.LESS_EQUAL ||
      type === TokenType.NOT_EQUAL
    );
  }

  private current(): Token {
    return (
      this.tokens[this.position] ?? {
        type: TokenType.END_OF_FILE,
        value: "",
        line: 0,
        column: 0
      }
    );
  }

  private advance(): Token {
    const token = this.current();

    if (!this.check(TokenType.END_OF_FILE)) {
      this.position++;
    }

    return token;
  }

  private check(type: TokenTypeValue): boolean {
    return this.current().type === type;
  }

  private expect(type: TokenTypeValue, message: string): Token {
    const token = this.current();

    if (!this.check(type)) {
      this.error(
        `${message} Se encontró ${token.type}${token.value ? ` (${token.value})` : ""}.`
      );
    }

    return this.advance();
  }

  private error(message: string): never {
    const token = this.current();
    throw new ParserError(message, token.line, token.column);
  }
}

export default Parser;