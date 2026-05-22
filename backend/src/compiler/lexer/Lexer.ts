import { TokenType, type TokenType as TokenTypeValue } from "./TokenType";
import { createToken, type Token } from "./Token";

export class Lexer {
  private source: string;
  private position: number;
  private line: number;
  private column: number;

  constructor(source: string) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token: Token;

    do {
      token = this.getNextToken();
      tokens.push(token);
    } while (token.type !== TokenType.END_OF_FILE);

    return tokens;
  }

  public getNextToken(): Token {
    this.skipWhitespaceAndComments();

    const currentChar = this.current();

    if (currentChar === "\0") {
      return createToken(TokenType.END_OF_FILE, "", this.line, this.column);
    }

    const startLine = this.line;
    const startColumn = this.column;

    if (this.isAlpha(currentChar) || currentChar === "_") {
      return this.readIdentifierOrKeyword();
    }

    if (this.isDigit(currentChar)) {
      return this.readNumber();
    }

    if (currentChar === "-" && this.isDigit(this.peek())) {
      return this.readNumber();
    }

    if (currentChar === "'") {
      return this.readString();
    }

    if (currentChar === ">") {
      const nextChar = this.peek();

      if (nextChar === "=") {
        this.advance();
        this.advance();
        return createToken(TokenType.GREATER_EQUAL, ">=", startLine, startColumn);
      }

      this.advance();
      return createToken(TokenType.GREATER, ">", startLine, startColumn);
    }

    if (currentChar === "<") {
      const nextChar = this.peek();

      if (nextChar === "=") {
        this.advance();
        this.advance();
        return createToken(TokenType.LESS_EQUAL, "<=", startLine, startColumn);
      }

      if (nextChar === ">") {
        this.advance();
        this.advance();
        return createToken(TokenType.NOT_EQUAL, "<>", startLine, startColumn);
      }

      this.advance();
      return createToken(TokenType.LESS, "<", startLine, startColumn);
    }

    if (currentChar === "!") {
      const nextChar = this.peek();

      if (nextChar === "=") {
        this.advance();
        this.advance();
        return createToken(TokenType.NOT_EQUAL, "!=", startLine, startColumn);
      }

      this.advance();
      return createToken(TokenType.INVALID, "!", startLine, startColumn);
    }

    this.advance();

    switch (currentChar) {
      case "=":
        return createToken(TokenType.EQUAL, "=", startLine, startColumn);

      case "*":
        return createToken(TokenType.ASTERISK, "*", startLine, startColumn);

      case ",":
        return createToken(TokenType.COMMA, ",", startLine, startColumn);

      case ";":
        return createToken(TokenType.SEMICOLON, ";", startLine, startColumn);

      case ".":
        return createToken(TokenType.DOT, ".", startLine, startColumn);

      case "(":
        return createToken(TokenType.LEFT_PAREN, "(", startLine, startColumn);

      case ")":
        return createToken(TokenType.RIGHT_PAREN, ")", startLine, startColumn);

      case "+":
        return createToken(TokenType.PLUS, "+", startLine, startColumn);

      case "-":
        return createToken(TokenType.MINUS, "-", startLine, startColumn);

      case "/":
        return createToken(TokenType.SLASH, "/", startLine, startColumn);

      default:
        return createToken(TokenType.INVALID, currentChar, startLine, startColumn);
    }
  }

  private current(): string {
    if (this.position >= this.source.length) {
      return "\0";
    }

    return this.source[this.position] ?? "\0";
  }

  private advance(): void {
    const currentChar = this.current();

    if (currentChar === "\n") {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }

    this.position++;
  }

  private peek(): string {
    const nextPosition = this.position + 1;

    if (nextPosition >= this.source.length) {
      return "\0";
    }

    return this.source[nextPosition] ?? "\0";
  }

  private skipWhitespaceAndComments(): void {
    let shouldContinue = true;

    while (shouldContinue) {
      shouldContinue = false;

      while (
        this.current() === " " ||
        this.current() === "\t" ||
        this.current() === "\n" ||
        this.current() === "\r"
      ) {
        this.advance();
      }

      if (this.current() === "-" && this.peek() === "-") {
        while (this.current() !== "\0" && this.current() !== "\n") {
          this.advance();
        }

        shouldContinue = true;
      }

      if (this.current() === "/" && this.peek() === "*") {
        this.advance();
        this.advance();

        while (
          this.current() !== "\0" &&
          !(this.current() === "*" && this.peek() === "/")
        ) {
          this.advance();
        }

        if (this.current() === "*" && this.peek() === "/") {
          this.advance();
          this.advance();
        }

        shouldContinue = true;
      }
    }
  }

  private readIdentifierOrKeyword(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = "";

    while (
      this.current() !== "\0" &&
      (this.isAlphaNumeric(this.current()) || this.current() === "_")
    ) {
      value += this.current();
      this.advance();
    }

    const keywordType = this.keywordToTokenType(value);

    if (keywordType) {
      return createToken(keywordType, value, startLine, startColumn);
    }

    return createToken(TokenType.IDENTIFIER, value, startLine, startColumn);
  }

  private readNumber(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = "";

    if (this.current() === "-") {
      value += this.current();
      this.advance();
    }

    while (this.current() !== "\0" && this.isDigit(this.current())) {
      value += this.current();
      this.advance();
    }

    if (this.current() === "." && this.isDigit(this.peek())) {
      value += this.current();
      this.advance();

      while (this.current() !== "\0" && this.isDigit(this.current())) {
        value += this.current();
        this.advance();
      }
    }

    return createToken(TokenType.NUMBER, value, startLine, startColumn);
  }

  private readString(): Token {
    const startLine = this.line;
    const startColumn = this.column;
    let value = "";

    this.advance();

    while (this.current() !== "\0" && this.current() !== "'") {
      value += this.current();
      this.advance();
    }

    if (this.current() === "'") {
      this.advance();
      return createToken(TokenType.STRING, value, startLine, startColumn);
    }

    return createToken(TokenType.INVALID, value, startLine, startColumn);
  }

  private keywordToTokenType(value: string): TokenTypeValue | null {
    const upperValue = value.toUpperCase();

    const keywords: Record<string, TokenTypeValue> = {
      SELECT: TokenType.SELECT,
      FROM: TokenType.FROM,
      WHERE: TokenType.WHERE,
      INSERT: TokenType.INSERT,
      INTO: TokenType.INTO,
      VALUES: TokenType.VALUES,
      UPDATE: TokenType.UPDATE,
      SET: TokenType.SET,
      DELETE: TokenType.DELETE,
      CREATE: TokenType.CREATE,
      TABLE: TokenType.TABLE,
      DROP: TokenType.DROP,
      AND: TokenType.AND,
      OR: TokenType.OR,
      NOT: TokenType.NOT
    };

    return keywords[upperValue] ?? null;
  }

  private isAlpha(char: string): boolean {
    return /^[A-Za-z]$/.test(char);
  }

  private isDigit(char: string): boolean {
    return /^[0-9]$/.test(char);
  }

  private isAlphaNumeric(char: string): boolean {
    return /^[A-Za-z0-9]$/.test(char);
  }
}

export default Lexer;