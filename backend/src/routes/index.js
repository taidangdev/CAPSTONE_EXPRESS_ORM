import { Router } from "express";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Các route nghiệp vụ (auth, users, images, ...) sẽ được gắn vào đây
// ở các giai đoạn tiếp theo, ví dụ:
// import authRoute from "./auth.route.js";
// router.use("/auth", authRoute);

export default router;
