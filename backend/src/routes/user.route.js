import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { updateMeSchema } from "../validations/user.validation.js";

const router = Router();

router.get("/me", protect, userController.getMe);
router.put("/me", protect, validate({ body: updateMeSchema }), userController.updateMe);

export default router;
