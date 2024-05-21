import { Router } from "express";
import { paymeGateway } from "@controllers/payme";
import catchAsync from "@helpers/catchAsync";

const paymeRouter = Router();

paymeRouter.post("/", catchAsync(paymeGateway));

export default paymeRouter;
