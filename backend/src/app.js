import express from "express";
import cors from "cors";
import env from "./config/env.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.use("/api", routes);

// Hai middleware này PHẢI đặt sau cùng, theo đúng thứ tự: notFoundHandler bắt
// mọi request không khớp route nào, errorHandler bắt mọi lỗi từ next(err).
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
