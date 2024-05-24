import { Router } from "express";
import * as httpStatus from "http-status";

import invoiceRoute from "@routes/invoice";
import paymeRouter from "@routes/payme";
import clickRouter from "@routes/click";

import ApiError, { errorConverter } from "@helpers/apiError";

const indexRoute = Router();

indexRoute.use("/invoices", invoiceRoute);
indexRoute.use("/payme", paymeRouter);
indexRoute.use("/click", clickRouter);

indexRoute.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

indexRoute.use(errorConverter);

export default indexRoute;
