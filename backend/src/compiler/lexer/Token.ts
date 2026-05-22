import type { TokenType } from "./TokenType";

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const createToken = (
  type: TokenType,
  value: string,
  line: number,
  column: number
): Token => {
  return {
    type,
    value,
    line,
    column
  };
};