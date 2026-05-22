import { describe, expect, it } from "vitest";
import { Lexer } from "../src/compiler/lexer/Lexer";
import { Parser, ParserError } from "../src/compiler/parser/Parser";
import { CompOperator, ExpressionType } from "../src/compiler/parser/AstNode";

const parseQuery = (query: string) => {
  const lexer = new Lexer(query);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);

  return parser.parse();
};

describe("Parser", () => {
  it("parsea SELECT * FROM usuarios;", () => {
    const ast = parseQuery("SELECT * FROM usuarios;");

    expect(ast.nodeType).toBe("SELECT");
    expect(ast.selectAll).toBe(true);
    expect(ast.columns).toEqual([]);
    expect(ast.tableName).toBe("usuarios");
    expect(ast.whereCondition).toBeNull();
  });

  it("parsea SELECT con una columna", () => {
    const ast = parseQuery("SELECT nombre FROM usuarios;");

    expect(ast.selectAll).toBe(false);
    expect(ast.columns).toEqual(["nombre"]);
    expect(ast.tableName).toBe("usuarios");
  });

  it("parsea SELECT con varias columnas", () => {
    const ast = parseQuery("SELECT nombre, edad, ciudad FROM usuarios;");

    expect(ast.selectAll).toBe(false);
    expect(ast.columns).toEqual(["nombre", "edad", "ciudad"]);
    expect(ast.tableName).toBe("usuarios");
  });

  it("parsea SELECT con WHERE numérico", () => {
    const ast = parseQuery("SELECT nombre FROM usuarios WHERE edad > 18;");

    expect(ast.whereCondition).not.toBeNull();
    expect(ast.whereCondition?.left.expressionType).toBe(ExpressionType.IDENTIFIER);
    expect(ast.whereCondition?.left.value).toBe("edad");
    expect(ast.whereCondition?.operator).toBe(CompOperator.GREATER);
    expect(ast.whereCondition?.right.expressionType).toBe(ExpressionType.NUMBER);
    expect(ast.whereCondition?.right.value).toBe("18");
  });

  it("parsea SELECT con WHERE string", () => {
    const ast = parseQuery("SELECT nombre FROM usuarios WHERE ciudad = 'Guatemala';");

    expect(ast.whereCondition).not.toBeNull();
    expect(ast.whereCondition?.left.value).toBe("ciudad");
    expect(ast.whereCondition?.operator).toBe(CompOperator.EQUAL);
    expect(ast.whereCondition?.right.expressionType).toBe(ExpressionType.STRING);
    expect(ast.whereCondition?.right.value).toBe("Guatemala");
  });

  it("permite punto y coma opcional", () => {
    const ast = parseQuery("SELECT * FROM usuarios");

    expect(ast.selectAll).toBe(true);
    expect(ast.tableName).toBe("usuarios");
  });

  it("lanza error si falta la lista de columnas", () => {
    expect(() => parseQuery("SELECT FROM usuarios;")).toThrow(ParserError);
  });

  it("lanza error si falta FROM", () => {
    expect(() => parseQuery("SELECT nombre usuarios;")).toThrow(ParserError);
  });

  it("lanza error si falta el nombre de la tabla", () => {
    expect(() => parseQuery("SELECT nombre FROM;")).toThrow(ParserError);
  });

  it("lanza error si WHERE no tiene condición completa", () => {
    expect(() => parseQuery("SELECT nombre FROM usuarios WHERE edad >;")).toThrow(
      ParserError
    );
  });

  it("lanza error si hay tokens después de la consulta", () => {
    expect(() => parseQuery("SELECT * FROM usuarios; SELECT * FROM productos;")).toThrow(
      ParserError
    );
  });

  it("parsea todos los operadores de comparación soportados", () => {
    const operators = [
      { sql: "=", expected: CompOperator.EQUAL },
      { sql: ">", expected: CompOperator.GREATER },
      { sql: "<", expected: CompOperator.LESS },
      { sql: ">=", expected: CompOperator.GREATER_EQUAL },
      { sql: "<=", expected: CompOperator.LESS_EQUAL },
      { sql: "!=", expected: CompOperator.NOT_EQUAL },
      { sql: "<>", expected: CompOperator.NOT_EQUAL }
    ];

    for (const operator of operators) {
      const ast = parseQuery(`SELECT nombre FROM usuarios WHERE edad ${operator.sql} 18;`);
      expect(ast.whereCondition?.operator).toBe(operator.expected);
    }
  });
});