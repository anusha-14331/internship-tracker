import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is required. Copy .env.example to .env and set JWT_SECRET.");
    process.exit(1);
  }
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
