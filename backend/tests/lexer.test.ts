import { describe, expect, it } from "vitest";
import { Lexer } from "../src/compiler/lexer/Lexer";
import { TokenType } from "../src/compiler/lexer/TokenType";

describe("Lexer", () => {
  it("reconoce palabras clave SQL", () => {
    const lexer = new Lexer("SELECT FROM WHERE INSERT UPDATE DELETE CREATE TABLE");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.SELECT);
    expect(tokens[1].type).toBe(TokenType.FROM);
    expect(tokens[2].type).toBe(TokenType.WHERE);
    expect(tokens[3].type).toBe(TokenType.INSERT);
    expect(tokens[4].type).toBe(TokenType.UPDATE);
    expect(tokens[5].type).toBe(TokenType.DELETE);
    expect(tokens[6].type).toBe(TokenType.CREATE);
    expect(tokens[7].type).toBe(TokenType.TABLE);
  });

  it("reconoce identificadores", () => {
    const lexer = new Lexer("usuarios nombre_completo edad tabla1 _id");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[0].value).toBe("usuarios");

    expect(tokens[1].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[1].value).toBe("nombre_completo");

    expect(tokens[2].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[2].value).toBe("edad");

    expect(tokens[3].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[3].value).toBe("tabla1");

    expect(tokens[4].type).toBe(TokenType.IDENTIFIER);
    expect(tokens[4].value).toBe("_id");
  });

  it("reconoce números enteros, decimales y negativos", () => {
    const lexer = new Lexer("42 3.14159 0 -15 100.00");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.NUMBER);
    expect(tokens[0].value).toBe("42");

    expect(tokens[1].type).toBe(TokenType.NUMBER);
    expect(tokens[1].value).toBe("3.14159");

    expect(tokens[2].type).toBe(TokenType.NUMBER);
    expect(tokens[2].value).toBe("0");

    expect(tokens[3].type).toBe(TokenType.NUMBER);
    expect(tokens[3].value).toBe("-15");

    expect(tokens[4].type).toBe(TokenType.NUMBER);
    expect(tokens[4].value).toBe("100.00");
  });

  it("reconoce strings con comillas simples", () => {
    const lexer = new Lexer("'Hola Mundo' 'SQL es genial'");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.STRING);
    expect(tokens[0].value).toBe("Hola Mundo");

    expect(tokens[1].type).toBe(TokenType.STRING);
    expect(tokens[1].value).toBe("SQL es genial");
  });

  it("reconoce operadores de comparación", () => {
    const lexer = new Lexer("= != <> < > <= >=");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.EQUAL);
    expect(tokens[1].type).toBe(TokenType.NOT_EQUAL);
    expect(tokens[2].type).toBe(TokenType.NOT_EQUAL);
    expect(tokens[3].type).toBe(TokenType.LESS);
    expect(tokens[4].type).toBe(TokenType.GREATER);
    expect(tokens[5].type).toBe(TokenType.LESS_EQUAL);
    expect(tokens[6].type).toBe(TokenType.GREATER_EQUAL);
  });

  it("reconoce símbolos especiales", () => {
    const lexer = new Lexer("( ) , ; * .");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.LEFT_PAREN);
    expect(tokens[1].type).toBe(TokenType.RIGHT_PAREN);
    expect(tokens[2].type).toBe(TokenType.COMMA);
    expect(tokens[3].type).toBe(TokenType.SEMICOLON);
    expect(tokens[4].type).toBe(TokenType.ASTERISK);
    expect(tokens[5].type).toBe(TokenType.DOT);
  });

  it("tokeniza una consulta SELECT completa", () => {
    const lexer = new Lexer("SELECT * FROM usuarios WHERE edad > 18;");
    const tokens = lexer.tokenize();

    const expectedTypes = [
      TokenType.SELECT,
      TokenType.ASTERISK,
      TokenType.FROM,
      TokenType.IDENTIFIER,
      TokenType.WHERE,
      TokenType.IDENTIFIER,
      TokenType.GREATER,
      TokenType.NUMBER,
      TokenType.SEMICOLON,
      TokenType.END_OF_FILE
    ];

    expect(tokens.map((token) => token.type)).toEqual(expectedTypes);

    expect(tokens[3].value).toBe("usuarios");
    expect(tokens[5].value).toBe("edad");
    expect(tokens[7].value).toBe("18");
  });

  it("maneja caracteres inválidos", () => {
    const lexer = new Lexer("SELECT @ FROM usuarios");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.SELECT);
    expect(tokens[1].type).toBe(TokenType.INVALID);
    expect(tokens[1].value).toBe("@");
  });

  it("maneja strings sin cerrar como token inválido", () => {
    const lexer = new Lexer("SELECT 'Juan FROM usuarios;");
    const tokens = lexer.tokenize();

    const invalidToken = tokens.find((token) => token.type === TokenType.INVALID);

    expect(invalidToken).toBeDefined();
    expect(invalidToken?.value).toBe("Juan FROM usuarios;");
  });

  it("ignora espacios en blanco y comentarios", () => {
    const lexer = new Lexer(`
      SELECT  *   -- Seleccionar todo
      FROM usuarios
      /* Comentario multilínea */
      WHERE edad > 18
    `);

    const tokens = lexer.tokenize();

    const tokenTypesWithoutEof = tokens
      .filter((token) => token.type !== TokenType.END_OF_FILE)
      .map((token) => token.type);

    expect(tokenTypesWithoutEof).toEqual([
      TokenType.SELECT,
      TokenType.ASTERISK,
      TokenType.FROM,
      TokenType.IDENTIFIER,
      TokenType.WHERE,
      TokenType.IDENTIFIER,
      TokenType.GREATER,
      TokenType.NUMBER
    ]);
  });

  it("mantiene línea y columna para reportes de error", () => {
    const lexer = new Lexer("SELECT *\nFROM usuarios\nWHERE edad > 18");
    const tokens = lexer.tokenize();

    expect(tokens[0].type).toBe(TokenType.SELECT);
    expect(tokens[0].line).toBe(1);
    expect(tokens[0].column).toBe(1);

    expect(tokens[2].type).toBe(TokenType.FROM);
    expect(tokens[2].line).toBe(2);
    expect(tokens[2].column).toBe(1);

    expect(tokens[4].type).toBe(TokenType.WHERE);
    expect(tokens[4].line).toBe(3);
    expect(tokens[4].column).toBe(1);
  });
});