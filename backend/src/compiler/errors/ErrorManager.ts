import {
  CompilerErrorPhase,
  createCompilerError,
  type CompilerError
} from "./CompilerError";

export class ErrorManager {
  private errors: CompilerError[];
  private warnings: string[];

  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  public addError(
    phase: CompilerErrorPhase,
    message: string,
    line?: number,
    column?: number
  ): void {
    this.errors.push(createCompilerError(phase, message, line, column));
  }

  public addSemanticError(message: string, line?: number, column?: number): void {
    this.addError(CompilerErrorPhase.SEMANTIC, message, line, column);
  }

  public addWarning(message: string): void {
    this.warnings.push(message);
  }

  public hasErrors(): boolean {
    return this.errors.length > 0;
  }

  public getErrors(): CompilerError[] {
    return this.errors;
  }

  public getWarnings(): string[] {
    return this.warnings;
  }

  public clear(): void {
    this.errors = [];
    this.warnings = [];
  }
}

export default ErrorManager;