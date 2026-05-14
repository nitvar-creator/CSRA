import { NextResponse } from 'next/server';
import { ZodError, ZodSchema } from 'zod';

export type ValidationResult<T> =
  | { ok: true; data: T }
  | { ok: false; response: NextResponse };

export async function parseJson<T>(
  request: Request,
  schema: ZodSchema<T>,
): Promise<ValidationResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Invalid JSON body' },
        { status: 400 },
      ),
    };
  }
  return runSchema(schema, raw);
}

export function parseObject<T>(
  raw: unknown,
  schema: ZodSchema<T>,
): ValidationResult<T> {
  return runSchema(schema, raw);
}

function runSchema<T>(schema: ZodSchema<T>, raw: unknown): ValidationResult<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, message: 'Validation failed', issues: formatIssues(parsed.error) },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

function formatIssues(error: ZodError) {
  return error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
}

export function serverError() {
  return NextResponse.json(
    { success: false, message: 'Internal server error' },
    { status: 500 },
  );
}
