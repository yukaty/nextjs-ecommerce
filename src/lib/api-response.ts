import { NextResponse } from 'next/server';

// Standardized API response types
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper functions for consistent API responses
export function createSuccessResponse<T>(data?: T, message?: string): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  });
}

export function createErrorResponse(message: string, status: number = 400, error?: string): NextResponse<ApiErrorResponse> {
  return NextResponse.json({
    success: false,
    message,
    error,
  }, { status });
}

// Common error responses
export const ErrorResponses = {
  UNAUTHORIZED: () => createErrorResponse('Please log in.', 401),
  FORBIDDEN: () => createErrorResponse('Access denied.', 403),
  NOT_FOUND: (resource: string = 'Resource') => createErrorResponse(`${resource} not found.`, 404),
  VALIDATION_ERROR: (message: string) => createErrorResponse(message, 400),
  SERVER_ERROR: () => createErrorResponse('Server error occurred.', 500),
  MISSING_FIELDS: () => createErrorResponse('Required fields are missing.', 400),
};