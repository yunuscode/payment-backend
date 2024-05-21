import * as Joi from "joi";
import ApiError from "@helpers/apiError";

export const getInvoiceValidation = Joi.object({
  invoice_id: Joi.string().guid().required(),
});
