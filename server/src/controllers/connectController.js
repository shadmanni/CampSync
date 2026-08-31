import { dbAdapter } from "../store/dbAdapter.js";

/**
 * GET /api/connect/posts
 */
export const getPosts = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const posts = await dbAdapter.getPosts(category, search);
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/connect/posts
 */
export const createPost = async (req, res, next) => {
  try {
    const { title, content, category, isAnonymous, authorName } = req.body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Title and content are required." });
    }

    const authorId = req.user ? req.user.id : "u-guest";
    const resolvedAuthorName = req.user ? req.user.name : (authorName || "Verified Student");

    const newPost = await dbAdapter.createPost({
      authorId,
      authorName: resolvedAuthorName,
      isAnonymous: Boolean(isAnonymous),
      title: title.trim(),
      content: content.trim(),
      category: category || "General"
    });

    if (req.io) {
      req.io.emit("connect:new_post", newPost);
    }

    res.status(201).json(newPost);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/connect/posts/:id/upvote
 */
export const upvotePost = async (req, res, next) => {
  try {
    const upvotes = await dbAdapter.upvotePost(req.params.id);
    if (upvotes === null) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }
    res.json({ success: true, upvotes });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/connect/posts/:id/downvote
 */
export const downvotePost = async (req, res, next) => {
  try {
    const upvotes = await dbAdapter.downvotePost(req.params.id);
    if (upvotes === null) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }
    res.json({ success: true, upvotes });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/connect/posts/:id/comments
 */
export const addComment = async (req, res, next) => {
  try {
    const { content, authorName } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: "Comment content is required." });
    }

    const resolvedAuthor = req.user ? req.user.name : (authorName || "Verified Student");
    const comment = await dbAdapter.addComment(req.params.id, resolvedAuthor, content.trim());

    if (!comment) {
      return res.status(404).json({ success: false, error: "Post not found." });
    }

    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
};
