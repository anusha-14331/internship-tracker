import { Router } from "express";
import { Task } from "../models/Task.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

function parseDeadline(value) {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

router.use(authMiddleware);

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.userId }).sort({ deadline: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not fetch tasks." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;

    if (!title || deadline === undefined || deadline === null || deadline === "") {
      return res.status(400).json({ message: "Title and deadline are required." });
    }

    const deadlineDate = parseDeadline(deadline);
    if (!deadlineDate) {
      return res.status(400).json({ message: "Invalid deadline date." });
    }

    const task = await Task.create({
      title,
      description: description ?? "",
      deadline: deadlineDate,
      status: status === "completed" ? "completed" : "pending",
      userId: req.userId,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not create task." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { title, description, deadline, status } = req.body;
    const task = await Task.findOne({ _id: req.params.id, userId: req.userId });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (deadline !== undefined) {
      const next = parseDeadline(deadline);
      if (!next) {
        return res.status(400).json({ message: "Invalid deadline date." });
      }
      task.deadline = next;
    }
    if (status !== undefined) {
      if (!["pending", "completed"].includes(status)) {
        return res.status(400).json({ message: "Status must be pending or completed." });
      }
      task.status = status;
    }

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not update task." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const result = await Task.deleteOne({ _id: req.params.id, userId: req.userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }
    res.json({ message: "Task deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Could not delete task." });
  }
});

export default router;
