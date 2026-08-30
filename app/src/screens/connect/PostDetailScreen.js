import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Send,
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopAvatar } from "../../components/common/PopAvatar";

export const PostDetailScreen = ({ route, navigation }) => {
  const { post: initialPost } = route.params;
  const { user } = useAuth();

  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState(initialPost.comments || []);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleUpvote = async () => {
    const previousScore = post.upvotes || 0;
    setPost({ ...post, upvotes: previousScore + 1 });

    try {
      const res = await connectService.upvotePost(post.id);
      setPost({ ...post, upvotes: res.upvotes });
    } catch (err) {
      setPost({ ...post, upvotes: previousScore });
    }
  };

  const handleAddComment = async () => {
    if (!newComment || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = await connectService.addComment(
        post.id,
        newComment.trim(),
        user?.name || "Verified Student"
      );
      setComments((prev) => [...prev, comment]);
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
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion Thread</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Post Card */}
        <PopCard style={styles.mainCard}>
          <View style={styles.authorRow}>
            <PopAvatar
              name={post.authorName || "Student"}
              anonymous={post.isAnonymous}
              size={40}
            />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>
                {post.authorName || "Verified Student"}
              </Text>
              <Text style={styles.timeText}>{post.createdAt || "Recently"}</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: colors.violetSoft }]}>
              <Text style={styles.categoryBadgeText}>{post.category || "General"}</Text>
            </View>
          </View>

          <Text style={styles.postTitle}>{post.title}</Text>
          <Text style={styles.postBody}>{post.content}</Text>

          <View style={styles.statsRow}>
            <TouchableOpacity
              style={styles.upvoteBtn}
              onPress={handleUpvote}
              activeOpacity={0.7}
            >
              <ThumbsUp size={14} color={colors.violet} />
              <Text style={styles.upvoteText}>{post.upvotes || 0} upvotes</Text>
            </TouchableOpacity>

            <View style={styles.repliesCountRow}>
              <MessageSquare size={14} color={colors.inkSoft} />
              <Text style={styles.repliesCountText}>{comments.length} replies</Text>
            </View>
          </View>
        </PopCard>

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Responses ({comments.length})</Text>

        {/* Comments */}
        {comments.length === 0 ? (
          <PopCard style={styles.emptyComments} variant="inset">
            <Text style={styles.emptyText}>
              No replies yet. Be the first student to join the conversation!
            </Text>
          </PopCard>
        ) : (
          comments.map((c, idx) => (
            <PopCard key={c.id || idx} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <PopAvatar name={c.authorName || "Student"} size={28} />
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>{c.authorName || "Student"}</Text>
                  <Text style={styles.commentTime}>{c.createdAt || "Recently"}</Text>
                </View>
              </View>
              <Text style={styles.commentBody}>{c.content}</Text>
            </PopCard>
          ))
        )}
      </ScrollView>

      {/* Sticky Bottom Composer */}
      <View style={styles.composerContainer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Share your thoughts or answer..."
          placeholderTextColor={colors.inkFaint}
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newComment.trim() && styles.sendBtnDisabled]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || submitting}
          activeOpacity={0.7}
        >
          <Send size={16} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 50,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderInk
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  headerTitle: {
    ...typography.heading,
    color: colors.ink
  },
  scrollContent: {
    padding: spacing.containerPadding,
    paddingBottom: 90
  },
  mainCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md
  },
  authorMeta: {
    marginLeft: spacing.sm,
    flex: 1
  },
  authorName: {
    ...typography.badge,
    fontSize: 14,
    color: colors.ink
  },
  timeText: {
    ...typography.bodySm,
    fontSize: 11
  },
  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.borderInk
  },
  categoryBadgeText: {
    ...typography.badge,
    fontSize: 11,
    color: colors.violet
  },
  postTitle: {
    ...typography.heading,
    fontSize: 18,
    marginBottom: spacing.sm
  },
  postBody: {
    ...typography.bodyLg,
    lineHeight: 22,
    marginBottom: spacing.lg
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: spacing.md
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  upvoteText: {
    ...typography.badge,
    color: colors.violet,
    fontSize: 12
  },
  repliesCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  repliesCountText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "600"
  },
  sectionHeading: {
    ...typography.heading,
    fontSize: 15,
    marginBottom: spacing.md
  },
  emptyComments: {
    padding: spacing.lg,
    alignItems: "center"
  },
  emptyText: {
    ...typography.body,
    textAlign: "center"
  },
  commentCard: {
    marginBottom: spacing.sm,
    padding: spacing.md
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6
  },
  commentMeta: {
    marginLeft: spacing.sm,
    flex: 1
  },
  commentAuthor: {
    ...typography.badge,
    fontSize: 12.5,
    color: colors.ink
  },
  commentTime: {
    ...typography.bodySm,
    fontSize: 10
  },
  commentBody: {
    ...typography.body,
    color: colors.ink
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1.5,
    borderTopColor: colors.borderInk
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    color: colors.ink,
    fontSize: 14,
    maxHeight: 80
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    backgroundColor: colors.violet,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm,
    ...shadows.hardSm
  },
  sendBtnDisabled: {
    opacity: 0.5
  }
});
