import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/skills
 * Filter by category, type (OFFER | REQUEST), or search query
 */
export const getSkills = async (req, res, next) => {
  try {
    const { category, type, search } = req.query;
    const skills = await dbAdapter.getSkills({ category, type, search });
    res.json(skills);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/skills/:id
 */
export const getSkillById = async (req, res, next) => {
  try {
    const skill = await dbAdapter.getSkillById(req.params.id);
    if (!skill) {
      return res.status(404).json({ success: false, error: "Skill listing not found." });
    }
    res.json(skill);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/skills
 * Create a new skill offer or help request
 */
export const createSkill = async (req, res, next) => {
  try {
    const { title, description, category, type, pricing, contact } = req.body;

    if (!title || !title.trim() || !description || !description.trim()) {
      return res.status(400).json({ success: false, error: "Title and description are required." });
    }

    if (!contact || !contact.trim()) {
      return res.status(400).json({ success: false, error: "Contact details are required for peer connection." });
    }

    const userId = req.user ? req.user.id : "u-guest";
    const userName = req.user ? req.user.name : "Verified Student";
    const userDepartment = req.user ? req.user.department : "Student";
    const userHostel = req.user ? req.user.hostel : "Campus Hostel";

    const newSkill = await dbAdapter.createSkill({
      userId,
      userName,
      userDepartment,
      userHostel,
      title,
      description,
      category: category || "Tech & Coding",
      type: type === "REQUEST" ? "REQUEST" : "OFFER",
      pricing: pricing || "Free Peer Exchange",
      contact
    });

    // Broadcast new skill creation to all active clients
    if (req.io) {
      req.io.emit("skill:created", newSkill);
    }

    res.status(201).json(newSkill);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/skills/:id
 */
export const deleteSkill = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : "u-guest";
    const deleted = await dbAdapter.deleteSkill(req.params.id, userId);

    if (!deleted) {
      return res.status(404).json({ success: false, error: "Skill not found or unauthorized to delete." });
    }

    res.json({ success: true, message: "Skill listing removed successfully." });
  } catch (err) {
    next(err);
  }
};
