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
  Send
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
          activeOpacity={0.8}
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
              name={post.authorName || "Verified Student"}
              anonymous={post.isAnonymous}
              size={42}
              accentColor={colors.violet}
            />
            <View style={styles.authorMeta}>
              <Text style={styles.authorName}>{post.authorName || "Verified Student"}</Text>
              <Text style={styles.timeText}>{post.createdAt || "Recently"}</Text>
            </View>
            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{post.category || "General"}</Text>
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
              <ThumbsUp size={15} color={colors.violet} />
              <Text style={styles.upvoteText}>{post.upvotes || 0} upvotes</Text>
            </TouchableOpacity>

            <View style={styles.replyCounter}>
              <MessageSquare size={15} color={colors.inkFaint} />
              <Text style={styles.replyCounterText}>{comments.length} replies</Text>
            </View>
          </View>
        </PopCard>

        {/* Section Heading */}
        <Text style={styles.sectionHeading}>Responses ({comments.length})</Text>

        {/* Comments List */}
        {comments.length === 0 ? (
          <PopCard style={styles.emptyComments} variant="inset">
            <Text style={styles.emptyText}>No replies yet. Be the first to share your thoughts!</Text>
          </PopCard>
        ) : (
          comments.map((c, idx) => (
            <PopCard key={c.id || idx} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <PopAvatar name={c.authorName || "Student"} size={30} accentColor={colors.violet} />
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

      {/* Comment Input Composer */}
      <View style={styles.composerWrapper}>
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
          activeOpacity={0.8}
        >
          <Send size={16} color="#FFFFFF" />
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100
  },
  mainCard: {
    marginBottom: 16
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12
  },
  authorMeta: {
    flex: 1
  },
  authorName: {
    ...typography.label,
    fontSize: 15
  },
  timeText: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 11
  },
  tagBadge: {
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full
  },
  tagText: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "800",
    fontSize: 11
  },
  postTitle: {
    ...typography.h2,
    fontSize: 19,
    marginBottom: 6
  },
  postBody: {
    ...typography.bodyLg,
    color: colors.ink,
    lineHeight: 22,
    marginBottom: 16
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: 12
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    ...shadows.hardSm
  },
  upvoteText: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "800"
  },
  replyCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  replyCounterText: {
    ...typography.bodySm,
    color: colors.inkFaint
  },
  sectionHeading: {
    ...typography.label,
    fontSize: 15,
    marginBottom: 12,
    color: colors.ink
  },
  emptyComments: {
    padding: 16,
    alignItems: "center"
  },
  emptyText: {
    ...typography.body,
    textAlign: "center"
  },
  commentCard: {
    marginBottom: 10,
    padding: 12
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6
  },
  commentMeta: {
    flex: 1
  },
  commentAuthor: {
    ...typography.label,
    fontSize: 13
  },
  commentTime: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 10
  },
  commentBody: {
    ...typography.body,
    color: colors.ink,
    lineHeight: 19
  },
  composerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.canvas,
    borderTopWidth: 1.5,
    borderTopColor: colors.lineStrong
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600",
    maxHeight: 80,
    ...shadows.hardSm
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.violet,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    ...shadows.hardSm
  },
  sendBtnDisabled: {
    opacity: 0.4
  }
});
