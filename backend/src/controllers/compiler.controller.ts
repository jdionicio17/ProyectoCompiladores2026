import { Request, Response } from "express";
import { CompilerService } from "../compiler/CompilerService";
import type { CompileRequest } from "../types/CompileRequest";
import { sendError, sendSuccess } from "../utils/response";

const compilerService = new CompilerService();

export const compileQuery = (req: Request, res: Response) => {
    try {
        const body = req.body as Partial<CompileRequest>;

        if (!body.query) {
            return sendError(res, "El campo query es obligatorio.", 400, [
                {
                    phase: "SYSTEM",
                    message: "Debe enviar una consulta SQL en el campo query."
                }
            ]);
        }

        if (!body.dialect) {
            return sendError(res, "El campo dialect es obligatorio.", 400, [
                {
                    phase: "SYSTEM",
                    message:
                        "Debe enviar un dialecto válido: mysql, postgresql, sqlserver o mongodb."
                }
            ]);
        }

        const result = compilerService.compile({
            query: body.query,
            dialect: body.dialect
        });

        return sendSuccess(res, result);
    } catch (error) {
        return sendError(res, "Error interno al compilar la consulta.", 500, [
            {
                phase: "SYSTEM",
                message: error instanceof Error ? error.message : "Error desconocido."
            }
        ]);
    }
};