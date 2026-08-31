import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, KeyboardAvoidingView, Platform
} from "react-native";
import { ArrowLeft, ArrowUp, MessageSquare, Send } from "lucide-react-native";
import { colors, borders, radii, spacing, shadows, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopAvatar } from "../../components/common/PopAvatar";

const ACCENT = colors.violet;

export const PostDetailScreen = ({ route, navigation }) => {
  const { post: initialPost } = route.params;
  const { user } = useAuth();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialPost.comments || []);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpvote = async () => {
    const prev = post.upvotes || 0;
    setPost({ ...post, upvotes: prev + 1 });
    try {
      const res = await connectService.upvotePost(post._id || post.id);
      setPost({ ...post, upvotes: res.upvotes });
    } catch {
      setPost({ ...post, upvotes: prev });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    try {
      const comment = await connectService.addComment(
        post._id || post.id,
        newComment.trim(),
        user?.name || "Verified Student"
      );
      setComments(prev => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.warn("Failed to add comment:", err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <ArrowLeft size={20} color={ACCENT} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion Thread</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Post */}
        <PopCard accent={ACCENT} style={styles.mainCard}>
          <View style={styles.authorRow}>
            <PopAvatar
              name={post.isAnonymous ? "" : post.authorName}
              anonymous={post.isAnonymous}
              size={40}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.authorName}>{post.isAnonymous ? "Anonymous" : post.authorName}</Text>
              <Text style={styles.timeText}>{new Date(post.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{post.category || "General"}</Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.content}</Text>

          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.upvoteBtn} onPress={handleUpvote} activeOpacity={0.7}>
              <ArrowUp size={16} color={ACCENT} strokeWidth={2.6} />
              <Text style={styles.upvoteText}>{post.upvotes || 0} upvotes</Text>
            </TouchableOpacity>
            <View style={styles.commentsCountRow}>
              <MessageSquare size={14} color={colors.inkFaint} strokeWidth={2} />
              <Text style={styles.commentsCountText}>{comments.length} replies</Text>
            </View>
          </View>
        </PopCard>

        <Text style={styles.sectionTitle}>Responses ({comments.length})</Text>

        {comments.length === 0 ? (
          <PopCard style={styles.emptyCard}>
            <Text style={styles.emptyText}>No replies yet. Be the first to join the conversation!</Text>
          </PopCard>
        ) : (
          comments.map((c, idx) => (
            <PopCard key={c.id || idx} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <PopAvatar name={c.authorName || "S"} size={28} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.commentAuthor}>{c.authorName || "Student"}</Text>
                  <Text style={styles.commentTime}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}</Text>
                </View>
              </View>
              <Text style={styles.commentBody}>{c.content}</Text>
            </PopCard>
          ))
        )}
      </ScrollView>

      {/* Bottom Composer */}
      <View style={styles.composerContainer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Write a reply…"
          placeholderTextColor={colors.inkFaint}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newComment.trim() && { opacity: 0.4 }]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || submitting}
          activeOpacity={0.7}
        >
          <Send size={18} color={colors.onAccent} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding, paddingTop: 50, paddingBottom: spacing.sm,
    backgroundColor: colors.canvasTint, borderBottomWidth: 1.5, borderBottomColor: colors.lineStrong,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: radii.sm,
    backgroundColor: colors.violetSoft, ...borders.card,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { ...typography.h3, color: ACCENT },
  scrollContent: { padding: spacing.containerPadding, paddingBottom: 100, gap: 14 },
  mainCard: { padding: spacing.lg, marginBottom: 8 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: spacing.md },
  authorName: { fontSize: 15, fontWeight: "700", color: colors.ink },
  timeText: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  categoryTag: {
    backgroundColor: colors.violetSoft, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: radii.pill, ...borders.card,
  },
  categoryTagText: { fontSize: 11, fontWeight: "700", color: ACCENT },
  postTitle: { fontSize: 20, fontWeight: "800", color: colors.ink, marginBottom: spacing.sm, lineHeight: 28 },
  postBody: { fontSize: 15, color: colors.ink, lineHeight: 24, marginBottom: spacing.lg },
  statsRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.lg,
    borderTopWidth: 1.5, borderTopColor: colors.line, paddingTop: spacing.md,
  },
  upvoteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.violetSoft, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: radii.pill, ...borders.card,
  },
  upvoteText: { fontSize: 12, color: ACCENT, fontWeight: "700" },
  commentsCountRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  commentsCountText: { fontSize: 12, color: colors.inkFaint },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: ACCENT, marginBottom: 4 },
  emptyCard: { padding: spacing.lg, alignItems: "center" },
  emptyText: { fontSize: 14, color: colors.inkSoft, textAlign: "center" },
  commentCard: { padding: spacing.md, marginBottom: 4 },
  commentHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 6 },
  commentAuthor: { fontSize: 13, fontWeight: "700", color: colors.ink },
  commentTime: { fontSize: 10, color: colors.inkFaint },
  commentBody: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  composerContainer: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: spacing.containerPadding, paddingVertical: spacing.sm,
    backgroundColor: colors.surface, borderTopWidth: 1.5, borderTopColor: colors.lineStrong,
  },
  composerInput: {
    flex: 1, backgroundColor: colors.surfaceInset, borderRadius: radii.pill,
    ...borders.card, paddingHorizontal: spacing.md, paddingVertical: 10,
    color: colors.ink, maxHeight: 90, fontSize: 14,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: ACCENT, ...borders.card, ...shadows.hardSm,
    alignItems: "center", justifyContent: "center", marginLeft: spacing.sm,
  },
});
