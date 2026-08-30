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
  User,
  Shield,
  Share2
} from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../context/AuthContext";
import { GlassCard } from "../../components/common/GlassCard";

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
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discussion Thread</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Post Card */}
        <GlassCard style={styles.mainPostCard}>
          <View style={styles.authorRow}>
            <View style={[styles.avatar, post.isAnonymous && styles.avatarAnon]}>
              {post.isAnonymous ? (
                <Shield size={18} color={colors.textSubtle} />
              ) : (
                <Text style={styles.avatarLetter}>
                  {(post.authorName || "S").charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>
                {post.authorName || "Verified Student"}
              </Text>
              <Text style={styles.timeText}>{post.createdAt || "Recently"}</Text>
            </View>
            <View style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{post.category || "General"}</Text>
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
              <ThumbsUp size={16} color={colors.primary} />
              <Text style={styles.upvoteText}>{post.upvotes || 0} upvotes</Text>
            </TouchableOpacity>

            <View style={styles.commentsCountRow}>
              <MessageSquare size={16} color={colors.textSubtle} />
              <Text style={styles.commentsCountText}>{comments.length} replies</Text>
            </View>
          </View>
        </GlassCard>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Responses ({comments.length})</Text>

        {/* Comments List */}
        {comments.length === 0 ? (
          <GlassCard style={styles.emptyComments}>
            <Text style={styles.emptyCommentsText}>
              No replies yet. Be the first to join the conversation!
            </Text>
          </GlassCard>
        ) : (
          comments.map((c, idx) => (
            <GlassCard key={c.id || idx} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatar}>
                  <Text style={styles.commentAvatarLetter}>
                    {(c.authorName || "S").charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.commentMeta}>
                  <Text style={styles.commentAuthor}>{c.authorName || "Student"}</Text>
                  <Text style={styles.commentTime}>{c.createdAt || "Recently"}</Text>
                </View>
              </View>
              <Text style={styles.commentBody}>{c.content}</Text>
            </GlassCard>
          ))
        )}
      </ScrollView>

      {/* Sticky Bottom Comment Composer */}
      <View style={styles.composerContainer}>
        <TextInput
          style={styles.composerInput}
          placeholder="Write a reply or answer..."
          placeholderTextColor={colors.textSubtle}
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
          <Send size={18} color={colors.textInverse} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingTop: 50,
    paddingBottom: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center"
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary
  },
  scrollContent: {
    padding: spacing.containerPadding,
    paddingBottom: 100
  },
  mainPostCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  avatarAnon: {
    backgroundColor: colors.bgSubtle
  },
  avatarLetter: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16
  },
  authorMeta: {
    flex: 1
  },
  authorName: {
    ...typography.label,
    fontSize: 15,
    color: colors.textPrimary
  },
  timeText: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 11
  },
  categoryTag: {
    backgroundColor: colors.bgDim,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full
  },
  categoryTagText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700",
    fontSize: 11
  },
  postTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.sm
  },
  postBody: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    lineHeight: 24,
    marginBottom: spacing.lg
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.md
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bgDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full
  },
  upvoteText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700"
  },
  commentsCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  commentsCountText: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 15,
    marginBottom: spacing.md,
    color: colors.primary
  },
  emptyComments: {
    padding: spacing.lg,
    alignItems: "center"
  },
  emptyCommentsText: {
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
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  commentAvatarLetter: {
    color: colors.textInverse,
    fontSize: 12,
    fontWeight: "700"
  },
  commentMeta: {
    flex: 1
  },
  commentAuthor: {
    ...typography.label,
    fontSize: 13,
    color: colors.textPrimary
  },
  commentTime: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 10
  },
  commentBody: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 20
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.sm,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.textPrimary,
    maxHeight: 90,
    fontSize: 14
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary, // Warm Orange #FF6F3C
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.sm
  },
  sendBtnDisabled: {
    opacity: 0.4
  }
});
