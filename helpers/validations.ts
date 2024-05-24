import * as Joi from "joi";

export const getInvoiceValidation = Joi.object({
  invoice_id: Joi.string().guid().required(),
});

export const createInvoiceValidation = Joi.object({
  provider: Joi.string().valid("payme").required(),
  amount: Joi.number().min(1000).required(),
});

export const clickPrepareRequestValidation = Joi.object({
  click_trans_id: Joi.number().integer().required().label("ID of transaction"),
  service_id: Joi.number().integer().required().label("ID of the service"),
  click_paydoc_id: Joi.number()
    .integer()
    .required()
    .label("Payment ID in CLICK system"),
  merchant_trans_id: Joi.string()
    .required()
    .label(
      "Order ID / personal account / login in the billing of the supplier",
    ),
  amount: Joi.number().required().label("Payment Amount (in soums)"),
  action: Joi.number().integer().valid(0).required().label("Action to perform"),
  error: Joi.number()
    .integer()
    .required()
    .label("Status code about completion of payment"),
  error_note: Joi.string()
    .allow("")
    .label("Identification of the code to complete the payment"),
  sign_time: Joi.string()
    .required()
    .label("Payment date")
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  sign_string: Joi.string()
    .required()
    .label("TestString confirming the authenticity of the submitted query"),
});

export const clickComplateRequestValidation = Joi.object({
  click_trans_id: Joi.number().integer().required().label("ID of transaction"),
  service_id: Joi.number().integer().required().label("ID of the service"),
  click_paydoc_id: Joi.number()
    .integer()
    .required()
    .label("Payment ID in CLICK system"),
  merchant_trans_id: Joi.string()
    .required()
    .label(
      "Order ID / personal account / login in the billing of the supplier",
    ),
  amount: Joi.number().required().label("Payment Amount (in soums)"),
  action: Joi.number().integer().valid(0).required().label("Action to perform"),
  error: Joi.number()
    .integer()
    .required()
    .label("Status code about completion of payment"),
  error_note: Joi.string()
    .allow("")
    .label("Identification of the code to complete the payment"),
  sign_time: Joi.string()
    .required()
    .label("Payment date")
    .pattern(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/),
  sign_string: Joi.string()
    .required()
    .label("TestString confirming the authenticity of the submitted query"),
  merchant_prepare_id: Joi.number()
    .integer()
    .required()
    .label("Merchant prepare id"),
});
