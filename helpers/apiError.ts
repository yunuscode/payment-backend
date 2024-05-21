import { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import * as httpStatus from "http-status";

class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number,
    message: string | undefined,
    isOperational = true,
    stack = "",
  ) {
    super(message);
    this.statusCode = statusCode || 500;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;

export const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err;

  console.log(error.message + "");

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof Prisma.PrismaClientKnownRequestError
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;

    const message = error?.message?.includes("prisma")
      ? "Database error"
      : error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message + "", false, err.stack);
  }

  errorHandler(error, req, res, next);
};

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res) => {
  let { statusCode, message } = err;

  if (!statusCode || !message) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
  };

  res.status(statusCode).send(response);
};
