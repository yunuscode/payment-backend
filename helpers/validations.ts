import * as Joi from "joi";

export const getInvoiceValidation = Joi.object({
  invoice_id: Joi.string().guid().required(),
});

export const createInvoiceValidation = Joi.object({
  provider: Joi.string().valid("payme").required(),
  amount: Joi.number().min(1000).required(),
});
