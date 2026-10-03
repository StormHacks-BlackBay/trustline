import { ApiErrorSchema, ScribeTokenResponseSchema } from "./schemas";

export class ApiError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
  ) {
    super(code);
  }
}

async function readError(response: Response): Promise<ApiError> {
  const body = ApiErrorSchema.safeParse(await response.json().catch(() => null));
  return new ApiError(body.success ? body.data.error : "request_failed", response.status);
}

export async function fetchScribeToken(): Promise<string> {
  const response = await fetch("/api/scribe-token", { method: "POST" });
  if (!response.ok) throw await readError(response);
  return ScribeTokenResponseSchema.parse(await response.json()).token;
}

export { readError };
