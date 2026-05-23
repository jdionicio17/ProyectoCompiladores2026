import type { CompileRequest } from "../types/CompileRequest";
import type { CompileResponse } from "../types/CompileResponse";

const API_URL = "http://localhost:3001/api/compiler";

export const compileQuery = async (
    request: CompileRequest
): Promise<CompileResponse> => {
    const response = await fetch(`${API_URL}/compile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(request)
    });

    const data = (await response.json()) as CompileResponse;

    if (!response.ok) {
        return {
            ...data,
            success: false,
            status: "INVALID",
            message: data.message || "Error al comunicarse con el backend."
        };
    }

    return data;
};