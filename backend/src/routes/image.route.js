import { Router } from "express";
import * as imageController from "../controllers/image.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createImageSchema } from "../validations/image.validation.js";
import { idParamSchema } from "../validations/common.validation.js";

const router = Router();

router.post(
  "/",
  protect,
  upload.single("image"),
  validate({ body: createImageSchema }),
  imageController.createImage,
);

router.delete("/:id", protect, validate({ params: idParamSchema }), imageController.deleteImage);

export default router;
