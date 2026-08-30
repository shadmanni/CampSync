import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/tasks
 * Filter by status (OPEN, ASSIGNED, COMPLETED, ALL) or category
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, category } = req.query;
    const tasks = await dbAdapter.getTasks({ status, category });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/tasks/:id
 */
export const getTaskById = async (req, res, next) => {
  try {
    const task = await dbAdapter.getTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, error: "Task not found." });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tasks
 * Create a new micro-task / campus errand
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, reward, category, pickupLocation, dropLocation, deadline } = req.body;

    if (!title || !title.trim() || !description || !description.trim() || !reward) {
      return res.status(400).json({ success: false, error: "Title, description, and cash reward amount are required." });
    }

    const rewardNum = parseFloat(reward);
    if (isNaN(rewardNum) || rewardNum <= 0) {
      return res.status(400).json({ success: false, error: "Valid cash reward amount is required." });
    }

    const creatorId = req.user ? req.user.id : "u-guest";
    const creatorName = req.user ? req.user.name : "Verified Student";
    const creatorHostel = req.user ? req.user.hostel : "Campus Hostel";

    const newTask = await dbAdapter.createTask({
      creatorId,
      creatorName,
      creatorHostel,
      title,
      description,
      reward: rewardNum,
      category: category || "Errands",
      pickupLocation,
      dropLocation,
      deadline: deadline || "Within 2 hours"
    });

    // Broadcast new task to all active clients
    if (req.io) {
      req.io.emit("task:created", newTask);
    }

    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tasks/:id/accept
 * Concurrency-safe atomic task assignment
 */
export const acceptTask = async (req, res, next) => {
  try {
    const { assignedToName } = req.body;
    const assignedToId = req.user ? req.user.id : `u-student-${Date.now()}`;
    const studentName = req.user ? req.user.name : (assignedToName || "Verified Student Runner");

    const result = await dbAdapter.assignAtomicTask(req.params.id, assignedToId, studentName);

    if (!result.success) {
      return res.status(409).json({ success: false, error: result.error });
    }

    // Broadcast real-time assignment update
    if (req.io) {
      req.io.emit("task:assigned", {
        taskId: result.task.id,
        status: result.task.status,
        assignedToName: result.task.assignedToName
      });
    }

    res.json({ success: true, task: result.task });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/tasks/:id/complete
 * Atomic task completion
 */
export const completeTask = async (req, res, next) => {
  try {
    const completedById = req.user ? req.user.id : "u-guest";
    const result = await dbAdapter.completeAtomicTask(req.params.id, completedById);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    // Broadcast real-time completion update
    if (req.io) {
      req.io.emit("task:completed", {
        taskId: result.task.id,
        status: result.task.status
      });
    }

    res.json({ success: true, task: result.task });
  } catch (err) {
    next(err);
  }
};
