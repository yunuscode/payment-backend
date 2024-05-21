import { Router } from "express";
import invoiceRoute from "@routes/invoice";
import ApiError, { errorConverter } from "@helpers/apiError";
import * as httpStatus from "http-status";

const indexRoute = Router();

indexRoute.use("/invoices", invoiceRoute);

indexRoute.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

indexRoute.use(errorConverter);

export default indexRoute;
