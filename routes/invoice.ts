import { Router } from "express";
import AuthMiddleware from "@middlewares/auth";
import * as InvoiceController from "@controllers/invoice";
import catchAsync from "@helpers/catchAsync";

const invoiceRoute = Router();

invoiceRoute.get(
  "/:invoice_id",
  AuthMiddleware,
  catchAsync(InvoiceController.getInvoiceById),
);

export default invoiceRoute;
