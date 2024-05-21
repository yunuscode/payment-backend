import { Request, Response } from "express";
import * as Validations from "@helpers/validations";
import ApiError from "@helpers/apiError";
import prisma from "@prisma/index";

export async function getInvoiceById(request: Request, response: Response) {
  const params = Validations.getInvoiceValidation.validate(request.params);

  if (params.error) {
    throw new ApiError(400, "Bad request: Params invalid");
  }

  const { invoice_id } = params.value;

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoice_id,
    },
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return response.status(200).json({
    ok: true,
    data: invoice,
  });
}

export async function createInvoice(request: Request, response: Response) {
  const data = Validations.createInvoiceValidation.validate(request.body);

  if (data.error) {
    throw new ApiError(400, "Bad request: Params invalid");
  }

  const { provider, amount } = data.value;

  const invoice = await prisma.invoice.create({
    data: {
      type: provider,
      amount: amount,
    },
  });

  const PAYME_URL = "https://payme.uz";

  return response.status(201).json({
    ok: true,
    data: {
      invoice_id: invoice.id,
      amount: invoice.amount,
      payme_url: PAYME_URL,
    },
  });
}
