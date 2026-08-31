import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, TextInput, StyleSheet,
  TouchableOpacity, Modal, ScrollView, RefreshControl
} from "react-native";
import {
  MessageSquare, Plus, Search, ArrowUp, Send, X,
  Hash, Users, BookOpen, HelpCircle, Megaphone
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { PopAvatar } from "../../components/common/PopAvatar";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";

const CATEGORIES = ["All", "Academic", "Lost & Found", "General", "Confessions"];
const ACCENT = colors.violet;

export const ConnectFeedScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await connectService.getPosts(category, search);
      setPosts(data?.posts || data || []);
    } catch (err) {
      console.warn("[ConnectFeed] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, search]);

  useEffect(() => { load(); }, [load]);

  // Real-time: listen for new posts from other clients
  useEffect(() => {
    socketService.connect();
    const handler = (post) => {
      setPosts(prev => {
        if (prev.some(p => p.id === post.id)) return prev;
        return [post, ...prev];
      });
    };
    socketService.on("connect:new_post", handler);
    return () => socketService.off("connect:new_post", handler);
  }, []);

  const onRefresh = () => { setRefreshing(true); load(); };

  const handleUpvote = async (postId) => {
    try {
      const res = await connectService.upvotePost(postId);
      setPosts(prev => prev.map(p =>
        (p.id || p._id) === postId ? { ...p, upvotes: res.upvotes ?? (p.upvotes || 0) + 1 } : p
      ));
    } catch (err) {
      console.warn("[ConnectFeed] Upvote error:", err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const res = await connectService.createPost({
        ...formData,
        authorName: user?.name || "Student",
      });
      setPosts(prev => [res.post || res, ...prev]);
      setCreateOpen(false);
    } catch (err) {
      console.warn("[ConnectFeed] Create error:", err);
    }
  };

  const renderPost = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigation.navigate("PostDetail", { post: item })}
    >
      <PopCard accent={ACCENT} style={styles.postCard}>
        {/* Author row */}
        <View style={styles.authorRow}>
          <PopAvatar
            name={item.isAnonymous ? "" : item.authorName}
            anonymous={item.isAnonymous}
            size={36}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.authorName}>
              {item.isAnonymous ? "Anonymous" : item.authorName}
            </Text>
            <Text style={styles.postMeta}>
              {item.category} · {item.createdAt && !isNaN(new Date(item.createdAt).getTime()) ? new Date(item.createdAt).toLocaleDateString() : 'Recently'}
            </Text>
          </View>
          <View style={[styles.categoryBadge, { backgroundColor: colors.violetSoft }]}>
            <Text style={[styles.categoryBadgeText, { color: ACCENT }]}>{item.category}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.postTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.postContent} numberOfLines={3}>{item.content}</Text>

        {/* Actions */}
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.upvoteBtn} onPress={() => handleUpvote(item.id || item._id)}>
            <ArrowUp size={16} color={ACCENT} strokeWidth={2.6} />
            <Text style={[styles.upvoteCount, { color: ACCENT }]}>{item.upvotes || 0}</Text>
          </TouchableOpacity>
          <View style={styles.commentCount}>
            <MessageSquare size={14} color={colors.inkFaint} strokeWidth={2} />
            <Text style={styles.commentCountText}>{item.comments?.length || 0}</Text>
          </View>
        </View>
      </PopCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusConnect"
        subtitle={`${posts.length} discussion${posts.length !== 1 ? 's' : ''}`}
        accent={ACCENT}
        icon={MessageSquare}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.inkFaint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions…"
            placeholderTextColor={colors.inkFaint}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
      >
        {CATEGORIES.map(cat => (
          <PopPill
            key={cat}
            label={cat}
            active={category === cat}
            onPress={() => setCategory(cat)}
            accent={ACCENT}
          />
        ))}
      </ScrollView>

      {/* Posts */}
      {loading ? (
        <View style={{ padding: spacing.containerPadding, gap: 16 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={item => item._id || item.id}
          renderItem={renderPost}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState
              icon={MessageSquare}
              title="No discussions yet"
              hint="Start the conversation — post the first discussion on campus."
            />
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setCreateOpen(true)}
        activeOpacity={0.85}
      >
        <Plus size={24} color={colors.onAccent} strokeWidth={2.8} />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreate}
      />
    </View>
  );
};

/* ── Create Post Modal ── */
function CreatePostModal({ visible, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setBusy(true);
    await onSubmit({ title: title.trim(), content: content.trim(), category, isAnonymous });
    setBusy(false);
    setTitle(""); setContent(""); setCategory("General"); setIsAnonymous(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Discussion</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.modalInput}
              placeholder="Discussion title…"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.modalInput, { height: 120, textAlignVertical: "top" }]}
              placeholder="Share your thoughts…"
              placeholderTextColor={colors.inkFaint}
              value={content}
              onChangeText={setContent}
              multiline
            />

            <Text style={[typography.label, { marginBottom: 8 }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                {["Academic", "Lost & Found", "General", "Confessions"].map(cat => (
                  <PopPill
                    key={cat}
                    label={cat}
                    active={category === cat}
                    onPress={() => setCategory(cat)}
                    accent={ACCENT}
                  />
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.anonToggle}
              onPress={() => setIsAnonymous(!isAnonymous)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.anonLabel}>Post anonymously</Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.modalActions}>
            <PopButton title="Cancel" variant="ghost" onPress={onClose} />
            <PopButton
              title={busy ? "Publishing…" : "Publish"}
              accent={ACCENT}
              icon={Send}
              onPress={handleSubmit}
              loading={busy}
              disabled={!title.trim() || !content.trim()}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  searchContainer: { paddingHorizontal: spacing.containerPadding, paddingTop: 12 },
  searchBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm,
    ...borders.card, paddingHorizontal: 14, height: 44,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.ink },
  pillsRow: { paddingHorizontal: spacing.containerPadding, paddingVertical: 12, gap: 8 },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, gap: 14 },
  postCard: { padding: 18 },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  authorName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  postMeta: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, ...borders.card },
  categoryBadgeText: { fontSize: 11, fontWeight: "700" },
  postTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  postContent: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 14 },
  actionsRow: { flexDirection: "row", alignItems: "center", gap: 20 },
  upvoteBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: colors.violetSoft, paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: radii.pill, ...borders.card,
  },
  upvoteCount: { fontSize: 13, fontWeight: "700" },
  commentCount: { flexDirection: "row", alignItems: "center", gap: 5 },
  commentCountText: { fontSize: 13, color: colors.inkFaint, fontWeight: "600" },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: ACCENT, ...borders.card, ...shadows.hard,
    alignItems: "center", justifyContent: "center",
  },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(23,21,15,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    ...borders.card, borderBottomWidth: 0,
    paddingHorizontal: spacing.containerPadding, paddingTop: 20, paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: colors.ink },
  modalInput: {
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    padding: 14, fontSize: 15, color: colors.ink, marginBottom: 14,
  },
  anonToggle: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, ...borders.card,
    backgroundColor: colors.surfaceInset, alignItems: "center", justifyContent: "center",
  },
  checkboxActive: { backgroundColor: ACCENT, borderColor: colors.lineStrong },
  checkmark: { color: colors.onAccent, fontSize: 14, fontWeight: "700" },
  anonLabel: { fontSize: 14, color: colors.inkSoft, fontWeight: "600" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
});
