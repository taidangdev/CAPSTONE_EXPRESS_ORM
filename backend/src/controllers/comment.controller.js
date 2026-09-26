import asyncHandler from "../utils/asyncHandler.js";
import { created, ok } from "../utils/response.js";
import * as commentService from "../services/comment.service.js";

export const listComments = asyncHandler(async (req, res) => {
  const result = await commentService.listComments(req.params.id, req.query);
  ok(res, result);
});

export const createComment = asyncHandler(async (req, res) => {
  // req.user.id lấy từ token qua middleware protect(), không nhận từ body.
  const comment = await commentService.createComment(req.params.id, req.user.id, req.body.content);
  created(res, comment, "Thêm bình luận thành công");
});
