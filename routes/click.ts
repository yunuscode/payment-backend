import { Router } from "express";
import {
  complateUrlController,
  prepareUrlController,
} from "@controllers/click";
import catchAsync from "@helpers/catchAsync";

const clickRouter = Router();

clickRouter.post("/prepare", catchAsync(prepareUrlController));
clickRouter.post("/complate", catchAsync(complateUrlController));

export default clickRouter;
