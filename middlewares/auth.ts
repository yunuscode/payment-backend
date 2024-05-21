import ApiError from "@helpers/apiError";
import { NextFunction, Request, Response } from "express";

const BASIC_USER = process.env.BASIC_USER;
const BASIC_PASSWORD = process.env.BASIC_PASSWORD;

export default function AuthMiddleware(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const encoded = Buffer.from(`${BASIC_USER}:${BASIC_PASSWORD}`).toString(
    "base64",
  );

  const authToken = `Basic ${encoded}`;

  if (authToken !== request.headers.authorization) {
    throw new ApiError(
      401,
      "You don't have access to request this endpoint! Try with correct header authroization.",
    );
  }

  next();
}
