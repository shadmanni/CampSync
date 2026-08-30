import React, { useState, useEffect } from "react";
import { MessageSquare, ThumbsUp, MessageCircle, Filter, Plus, UserX, UserCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const CampusConnect = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("Academic");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const categories = ["All", "Academic", "Lost & Found", "General", "Confessions"];

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  const fetchPosts = async () => {
    try {
      const url = activeCategory === "All" ? "/api/connect/posts" : `/api/connect/posts?category=${encodeURIComponent(activeCategory)}`;
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    }
  };

  const handleUpvote = async (id) => {
    try {
      const res = await fetch(`/api/connect/posts/${id}/upvote`, { method: "POST" });
      const data = await res.json();
      setPosts(posts.map(p => p.id === id ? { ...p, upvotes: data.upvotes } : p));
    } catch (err) {
      console.error("Failed to upvote:", err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/connect/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          isAnonymous,
          authorName: user ? user.name : "Verified Student"
        })
      });
      const data = await res.json();
      setPosts([data, ...posts]);
      setShowCreateModal(false);
      setNewTitle("");
      setNewContent("");
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Filter Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700" }}>CampusConnect</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Verified student discussion feed & campus updates.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          <span>New Discussion</span>
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: "6px 14px",
              borderRadius: "20px",
              border: "1px solid var(--border-glass)",
              background: activeCategory === cat ? "var(--primary-500)" : "rgba(30, 41, 59, 0.5)",
              color: activeCategory === cat ? "#fff" : "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Posts List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {posts.map((post) => (
          <div key={post.id} className="glass-card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: post.isAnonymous ? "rgba(244, 63, 94, 0.2)" : "rgba(99, 102, 241, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {post.isAnonymous ? <UserX size={16} color="#f43f5e" /> : <UserCheck size={16} color="#6366f1" />}
                </div>
                <div>
                  <span style={{ fontSize: "0.9rem", fontWeight: "600" }}>{post.authorName}</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-subtle)", marginLeft: "8px" }}>{post.createdAt}</span>
                </div>
              </div>

              <span className="badge badge-indigo">{post.category}</span>
            </div>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "8px" }}>{post.title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "16px", lineHeight: "1.6" }}>
              {post.content}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", borderTop: "1px solid var(--border-glass)", paddingTop: "12px" }}>
              <button
                onClick={() => handleUpvote(post.id)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontSize: "0.85rem" }}
              >
                <ThumbsUp size={16} color="var(--primary-500)" />
                <span>{post.upvotes} Upvotes</span>
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                <MessageCircle size={16} />
                <span>{post.comments?.length || 0} Comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Post Modal */}
      {showCreateModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.75)",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px"
        }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: "500px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.2rem", marginBottom: "16px" }}>Create Campus Discussion</h3>
            <form onSubmit={handleCreatePost} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Title</label>
                <input
                  className="input-field"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What's on your mind?"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Category</label>
                <select
                  className="input-field"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                >
                  <option value="Academic">Academic</option>
                  <option value="Lost & Found">Lost & Found</option>
                  <option value="General">General</option>
                  <option value="Confessions">Confessions</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", marginBottom: "4px" }}>Content</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: "100px" }}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Provide details..."
                  required
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="anon"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <label htmlFor="anon" style={{ fontSize: "0.85rem", cursor: "pointer" }}>Post Anonymously</label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
