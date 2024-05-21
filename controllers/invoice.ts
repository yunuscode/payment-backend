import { Request, Response } from "express";
import * as Validations from "@helpers/validations";
import ApiError from "@helpers/apiError";

export async function getInvoiceById(request: Request, response: Response) {
  const params = Validations.getInvoiceValidation.validate(request.params);

  if (params.error) {
    throw new ApiError(400, "Bad request: Params invalid");
  }
}
