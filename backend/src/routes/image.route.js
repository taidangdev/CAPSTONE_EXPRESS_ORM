import { Router } from "express";
import * as imageController from "../controllers/image.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createImageSchema, searchImageSchema } from "../validations/image.validation.js";
import { idParamSchema, paginationSchema } from "../validations/common.validation.js";

const router = Router();

// ⚠️ Thứ tự quan trọng trong nhóm route GET: "/search" phải khai báo TRƯỚC
// "/:id". Nếu để "/:id" trước, Express sẽ khớp "search" như một giá trị :id
// (và validate params sẽ báo lỗi vì "search" không phải số).
router.get("/", validate({ query: paginationSchema }), imageController.listImages);
router.get("/search", validate({ query: searchImageSchema }), imageController.searchImages);
router.get("/:id", validate({ params: idParamSchema }), imageController.getImageById);

router.post(
  "/",
  protect,
  upload.single("image"),
  validate({ body: createImageSchema }),
  imageController.createImage,
);

router.delete("/:id", protect, validate({ params: idParamSchema }), imageController.deleteImage);

export default router;
