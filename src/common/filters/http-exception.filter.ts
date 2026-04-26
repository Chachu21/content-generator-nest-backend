import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let message = 'An unexpected error occurred';
    let details = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const resp = exceptionResponse as any;
      message = resp.message || message;
      // If message is an array (typical for validation errors), join it or take the first one
      if (Array.isArray(resp.message)) {
        message = resp.message[0]; // Take first specific validation error as the main message
        details = resp.message;    // Keep the full array in details
      }
    }

    response.status(status).json({
      success: false,
      message,
      data: details, // Provide error details if available
      error: exception.name || 'Error',
    });
  }
}
