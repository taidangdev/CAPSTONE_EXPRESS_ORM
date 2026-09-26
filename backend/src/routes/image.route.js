import { Router } from "express";
import * as imageController from "../controllers/image.controller.js";
import * as commentController from "../controllers/comment.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { createImageSchema, searchImageSchema } from "../validations/image.validation.js";
import { createCommentSchema } from "../validations/comment.validation.js";
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

// Route bình luận gắn ở đây (thay vì file comment.route.js riêng) vì dùng
// chung tiền tố "/:id" với ảnh (xem doc/ROADMAP.md giai đoạn 5).
router.get(
  "/:id/comments",
  validate({ params: idParamSchema, query: paginationSchema }),
  commentController.listComments,
);
router.post(
  "/:id/comments",
  protect,
  validate({ params: idParamSchema, body: createCommentSchema }),
  commentController.createComment,
);

export default router;
