import {
  clickComplateRequestValidation,
  clickPrepareRequestValidation,
} from "@helpers/validations";
import prisma from "@prisma/index";
import { Request, Response } from "express";
import * as md5 from "md5";

const CLICK_SECRET_KEY = process.env.CLICK_SECRET_KEY;

export async function prepareUrlController(
  request: Request,
  response: Response,
) {
  const data = clickPrepareRequestValidation.validate(request.body);

  if (data.error) {
    return generateClickError(response, -8, data.error + "");
  }

  const {
    click_trans_id,
    service_id,
    click_paydoc_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    error,
    sign_string,
  } = data.value;

  const currentTimestamp = Date.now();

  const checkString = md5(
    click_trans_id +
      service_id +
      CLICK_SECRET_KEY +
      merchant_trans_id +
      amount +
      action +
      sign_time,
  );

  if (checkString !== sign_string) {
    return generateClickError(response, -1, "Sign check failed!");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: merchant_trans_id, status: "created" },
  });

  if (!invoice) {
    return generateClickError(response, -5, "Invoice not found!");
  }

  if (action != 0) {
    return generateClickError(response, -3, "Action not found!");
  }

  if (action == -4) {
    return generateClickError(response, -4, "Already paid!");
  }

  if (action == -9) {
    return generateClickError(response, -9, "Transaction cancelled!");
  }

  await prisma.clickTransactions.create({
    data: {
      click_trans_id: click_trans_id,
      merchant_trans_id: merchant_trans_id,
      service_id: service_id,
      click_paydoc_id: click_paydoc_id,
      payment_amount: amount,
      payment_action: action,
      payment_sign_time: sign_time,
      payment_error: error,
      merchant_prepare_id: currentTimestamp,
      invoiceId: invoice.id,
    },
  });

  return response.status(200).json({
    error: 0,
    error_note: "Success",
    click_trans_id: click_trans_id,
    merchant_trans_id: merchant_trans_id,
    merchant_prepare_id: currentTimestamp,
  });
}

export async function complateUrlController(
  request: Request,
  response: Response,
) {
  const data = clickComplateRequestValidation.validate(request.body);

  if (data.error) {
    return generateClickError(response, -8, data.error + "");
  }

  const {
    click_trans_id,
    service_id,
    merchant_trans_id,
    amount,
    action,
    sign_time,
    error,
    sign_string,
    merchant_prepare_id,
  } = data.value;

  const checkString = md5(
    click_trans_id +
      service_id +
      CLICK_SECRET_KEY +
      merchant_trans_id +
      amount +
      action +
      sign_time,
  );

  if (checkString !== sign_string) {
    return generateClickError(response, -1, "Sign check failed!");
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: merchant_trans_id, status: "created" },
  });

  if (!invoice) {
    return generateClickError(response, -5, "Invoice not found!");
  }

  if (action == -4) {
    return generateClickError(response, -4, "Already paid!");
  }

  if (action == -9) {
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: "expired" },
    });
    return generateClickError(response, -9, "Transaction cancelled!");
  }

  if (error < 0) {
    return generateClickError(response, -6, "Transaction isn't exist");
  }

  if (action != 1) {
    return generateClickError(response, -3, "Action not found!");
  }

  const clickTransaction = await prisma.clickTransactions.findFirst({
    where: { merchant_prepare_id: merchant_prepare_id },
  });

  if (!clickTransaction) {
    return generateClickError(response, -6, "Transaction isn't exist");
  }

  await prisma.invoice.update({
    where: {
      id: invoice.id,
    },
    data: { status: "paid" },
  });

  return response.status(200).json({
    error: 0,
    error_note: "Success",
    click_trans_id: click_trans_id,
    merchant_trans_id: merchant_trans_id,
    merchant_prepare_id: merchant_prepare_id,
  });
}

function generateClickError(
  response: Response,
  errorCode: number,
  note: string,
) {
  response.status(200).json({
    error: errorCode,
    error_note: note,
  });
}
