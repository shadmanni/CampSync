import express from "express";
import { getPosts, createPost, upvotePost, downvotePost, addComment } from "../controllers/connectController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/posts", getPosts);
router.post("/posts", optionalAuth, createPost);
router.post("/posts/:id/upvote", upvotePost);
router.post("/posts/:id/downvote", downvotePost);
router.post("/posts/:id/comments", optionalAuth, addComment);

export default router;
