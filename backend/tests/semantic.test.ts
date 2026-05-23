import { describe, expect, it } from "vitest";
import { Lexer } from "../src/compiler/lexer/Lexer";
import { Parser } from "../src/compiler/parser/Parser";
import { SemanticAnalyzer } from "../src/compiler/semantic/SemanticAnalyzer";
import { SymbolTable } from "../src/compiler/semantic/SymbolTable";
import { MongoDialect } from "../src/compiler/dialects/MongoDialect";
import { MySqlDialect } from "../src/compiler/dialects/MySqlDialect";

const buildAst = (query: string) => {
  const lexer = new Lexer(query);
  const tokens = lexer.tokenize();
  const parser = new Parser(tokens);

  return parser.parse();
};

const analyzeQuery = (query: string) => {
  const ast = buildAst(query);
  const symbolTable = new SymbolTable();
  const analyzer = new SemanticAnalyzer(symbolTable);

  return analyzer.analyze(ast);
};

describe("SemanticAnalyzer", () => {
  it("valida SELECT * FROM usuarios;", () => {
    const result = analyzeQuery("SELECT * FROM usuarios;");

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("valida columna existente en tabla usuarios", () => {
    const result = analyzeQuery("SELECT nombre FROM usuarios;");

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detecta tabla inexistente", () => {
    const result = analyzeQuery("SELECT nombre FROM clientes;");

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("clientes");
  });

  it("detecta columna inexistente", () => {
    const result = analyzeQuery("SELECT salario FROM usuarios;");

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("salario");
  });

  it("valida condición WHERE con tipos numéricos compatibles", () => {
    const result = analyzeQuery("SELECT nombre FROM usuarios WHERE edad > 18;");

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("detecta columna inexistente en WHERE", () => {
    const result = analyzeQuery("SELECT nombre FROM usuarios WHERE salario > 18;");

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("salario");
  });

  it("detecta tipos incompatibles en WHERE", () => {
    const result = analyzeQuery(
      "SELECT nombre FROM usuarios WHERE edad = 'dieciocho';"
    );

    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Tipos incompatibles");
  });

  it("valida comparación VARCHAR con STRING", () => {
    const result = analyzeQuery(
      "SELECT nombre FROM usuarios WHERE ciudad = 'Guatemala';"
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("valida comparación FLOAT con NUMBER", () => {
    const result = analyzeQuery(
      "SELECT nombre FROM productos WHERE precio > 100.50;"
    );

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("genera código intermedio MySQL", () => {
    const ast = buildAst("SELECT nombre FROM usuarios WHERE edad > 18;");
    const dialect = new MySqlDialect();

    const code = dialect.generateIntermediateCode(ast);

    expect(code).toBe("SELECT nombre FROM usuarios WHERE edad > 18;");
  });

  it("genera código equivalente MongoDB", () => {
    const ast = buildAst("SELECT nombre FROM usuarios WHERE edad > 18;");
    const dialect = new MongoDialect();

    const code = dialect.generateIntermediateCode(ast);

    expect(code).toBe('db.usuarios.find({ "edad": { "$gt": 18 } }, { "nombre": 1 });');
  });
});