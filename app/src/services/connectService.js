import api from "./api";

export const connectService = {
  // Fetch posts with optional category and search query
  async getPosts(category = "All", search = "") {
    const params = {};
    if (category && category !== "All") params.category = category;
    if (search && search.trim()) params.search = search.trim();

    return await api.get("/connect/posts", { params });
  },

  // Create new discussion post
  async createPost({ title, content, category, isAnonymous, authorName }) {
    return await api.post("/connect/posts", {
      title,
      content,
      category,
      isAnonymous: Boolean(isAnonymous),
      authorName
    });
  },

  // Upvote post
  async upvotePost(postId) {
    return await api.post(`/connect/posts/${postId}/upvote`);
  },

  // Add comment to post
  async addComment(postId, content, authorName) {
    return await api.post(`/connect/posts/${postId}/comments`, {
      content,
      authorName
    });
  }
};
