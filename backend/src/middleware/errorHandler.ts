import type { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  code?: string
}

function clientStatusAndMessage(err: AppError): { statusCode: number; message: string } {
  const raw = err.message ?? 'Internal Server Error'
  const code = err.code

  if (raw === 'Malformed part header' || raw.includes('Unexpected end of form')) {
    return {
      statusCode: 400,
      message:
        'Invalid multipart upload. In API clients, do not set Content-Type yourself for form-data (the tool must add boundary=...). Re-attach the file and ensure the field name is "resume".',
    }
  }

  if (typeof code === 'string' && code.startsWith('LIMIT_')) {
    return { statusCode: 400, message: raw }
  }

  return { statusCode: err.statusCode ?? 500, message: raw }
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const { statusCode, message } = clientStatusAndMessage(err)

  console.error(`[ERROR] ${statusCode} — ${message}`, {
    stack: err.stack,
    code: err.code,
    ...(err.message && err.message !== message && { underlying: err.message }),
  })

  res.status(statusCode).json({
    error: err.name ?? 'Error',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export function createError(message: string, statusCode = 500, code?: string): AppError {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.code = code
  return err
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'NotFound',
    message: `Route ${req.method} ${req.path} not found`,
  })
}