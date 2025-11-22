import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
dotenv.config();

const app = express();

/* -----------------------  CORS FIX (FINAL)  ----------------------- */

app.use(
  cors({
    origin: ["http://localhost:5173", "https://ansh-delta.vercel.app"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Handle preflight
/* -------------------- Body Parsers -------------------- */

app.use(express.json());
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});
app.use(express.urlencoded({ extended: true }));

/* -------------------- MongoDB -------------------- */

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

/* -------------------- Models -------------------- */

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ["DSA", "System Design", "Web Dev", "React", "JavaScript", "Other","Articles","Programming Language","Videos"],
  },
  status: {
    type: String,
    default: "not completed",
    enum: ["completed", "mark as read", "not completed", "need revision"],
  },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
});

const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

/* -------------------- JWT Auth Middleware -------------------- */

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Access denied" });

  jwt.verify(token, "codekar", (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = user;
    next();
  });
};

/* -------------------- Initialize Users (Hardcoded) -------------------- */

const initializeUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash("password123", 10);

      await User.create([
        {
          username: "Ansh",
          email: "user1@example.com",
          password: hashedPassword,
          name: "Ansh",
        },
        {
          username: "Harshita",
          email: "user2@example.com",
          password: hashedPassword,
          name: "Harshita",
        },
      ]);

      console.log("Users initialized: user1 & user2 (password: password123)");
    }
  } catch (error) {
    console.log("Error initializing users:", error);
  }
};

initializeUsers();

/* -------------------- Routes -------------------- */

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("📥 Login request received:", req.body.username);

    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, username: user.username },
      "codekar",
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// GET CURRENT USER
app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL USERS
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }).select("-password");
    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE TASK
app.post("/api/tasks", authenticateToken, async (req, res) => {
  try {
    const { title, link, category, assignedTo, notes } = req.body;

    const task = new Task({
      title,
      link,
      category,
      assignedBy: req.user.id,
      assignedTo,
      notes,
    });

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("assignedBy", "username name")
      .populate("assignedTo", "username name");

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// TASKS FOR CURRENT USER
app.get("/api/tasks/my-tasks", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.id })
      .populate("assignedBy", "username name")
      .populate("assignedTo", "username name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// TASKS CREATED BY CURRENT USER
app.get("/api/tasks/assigned-by-me", authenticateToken, async (req, res) => {
  try {
    const tasks = await Task.find({ assignedBy: req.user.id })
      .populate("assignedBy", "username name")
      .populate("assignedTo", "username name")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE TASK
app.patch("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.assignedTo.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    if (status) task.status = status;
    if (notes !== undefined) task.notes = notes;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignedBy", "username name")
      .populate("assignedTo", "username name");

    res.json(updatedTask);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE TASK
app.delete("/api/tasks/:id", authenticateToken, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    if (
      task.assignedBy.toString() !== req.user.id &&
      task.assignedTo.toString() !== req.user.id
    )
      return res.status(403).json({ message: "Not authorized" });

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

/* -------------------- Start Server -------------------- */

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
