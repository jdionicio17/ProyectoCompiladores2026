export const CompilerErrorPhase = {
  LEXICAL: "LEXICAL",
  SYNTACTIC: "SYNTACTIC",
  SEMANTIC: "SEMANTIC",
  SYSTEM: "SYSTEM"
} as const;

export type CompilerErrorPhase =
  (typeof CompilerErrorPhase)[keyof typeof CompilerErrorPhase];

export interface CompilerError {
  phase: CompilerErrorPhase;
  message: string;
  line?: number;
  column?: number;
}

export const createCompilerError = (
  phase: CompilerErrorPhase,
  message: string,
  line?: number,
  column?: number
): CompilerError => {
  return {
    phase,
    message,
    line,
    column
  };
};