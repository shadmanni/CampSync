import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput
} from "react-native";
import {
  MessageSquare,
  ThumbsUp,
  Search,
  Plus,
  User,
  Shield,
  Sparkles,
  Layers
} from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { socketService } from "../../services/socketService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { CategoryPill } from "../../components/common/CategoryPill";
import { StatusBadge } from "../../components/common/StatusBadge";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { CreatePostModal } from "./CreatePostModal";

const CATEGORIES = ["All", "Academic", "General", "Lost & Found"];

export const ConnectFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Fetch posts from backend
  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await connectService.getPosts(selectedCategory, searchQuery);
      setPosts(data || []);
    } catch (err) {
      setError(err.message || "Failed to load posts.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Real-time Socket.io listener for new posts
  useEffect(() => {
    const handleNewPost = (newPost) => {
      setPosts((prevPosts) => {
        // Prevent duplicate addition
        if (prevPosts.some((p) => p.id === newPost.id)) return prevPosts;

        // Check if category matches currently selected filter
        if (
          selectedCategory !== "All" &&
          selectedCategory.toLowerCase() !== newPost.category?.toLowerCase()
        ) {
          return prevPosts;
        }

        return [newPost, ...prevPosts];
      });
    };

    socketService.on("connect:new_post", handleNewPost);
    return () => {
      socketService.off("connect:new_post", handleNewPost);
    };
  }, [selectedCategory]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  };

  // Optimistic Upvote with Rollback on Error (Requirement 5)
  const handleUpvote = async (postId) => {
    const originalPosts = [...posts];

    // 1. Optimistic local update
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p
      )
    );

    try {
      const result = await connectService.upvotePost(postId);
      // Synchronize with verified backend score
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, upvotes: result.upvotes } : p
        )
      );
    } catch (err) {
      // 2. Rollback on failure
      setPosts(originalPosts);
      console.warn("[Connect] Upvote failed, state rolled back:", err.message);
    }
  };

  const renderPostCard = ({ item }) => {
    const isAnonymous = item.isAnonymous;
    const authorName = item.authorName || "Verified Student";
    const commentsCount = Array.isArray(item.comments) ? item.comments.length : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate("PostDetail", { post: item })}
      >
        <GlassCard style={styles.postCard}>
          {/* Post Header */}
          <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
              <View style={[styles.avatar, isAnonymous && styles.avatarAnon]}>
                {isAnonymous ? (
                  <Shield size={16} color={colors.textMuted} />
                ) : (
                  <User size={16} color={colors.primaryLight} />
                )}
              </View>
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>
                  {authorName}
                </Text>
                <Text style={styles.postTime}>{item.createdAt || "Recently"}</Text>
              </View>
            </View>

            <StatusBadge
              label={item.category || "General"}
              variant={item.category === "Academic" ? "primary" : item.category === "Lost & Found" ? "amber" : "cyan"}
              dot={false}
            />
          </View>

          {/* Post Content */}
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {item.content}
          </Text>

          {/* Actions & Counters */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleUpvote(item.id)}
              activeOpacity={0.7}
            >
              <ThumbsUp size={15} color={colors.primaryLight} />
              <Text style={styles.actionCount}>{item.upvotes || 0}</Text>
            </TouchableOpacity>

            <View style={styles.actionBtn}>
              <MessageSquare size={15} color={colors.textMuted} />
              <Text style={styles.actionText}>{commentsCount} comments</Text>
            </View>
          </View>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusConnect"
        subtitle="Live Student Community Feed"
        onNotificationPress={() => {}}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Search size={16} color={colors.textSubtle} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions or questions..."
          placeholderTextColor={colors.textSubtle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <CategoryPill
              label={item}
              active={selectedCategory === item}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Feed List / Loading / Error / Empty States */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Couldn't load discussions"
          message={error}
          onRetry={() => fetchPosts()}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          renderItem={renderPostCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primaryLight}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<MessageSquare size={32} color={colors.primaryLight} />}
              title="No discussions found"
              description={
                searchQuery
                  ? `No posts matched "${searchQuery}". Try a different keyword or category.`
                  : "Be the first student to post a question or announcement!"
              }
              actionTitle="Create Discussion"
              onAction={() => setModalVisible(true)}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={24} color={colors.textMain} />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={(newPost) => {
          if (
            selectedCategory === "All" ||
            selectedCategory.toLowerCase() === newPost.category?.toLowerCase()
          ) {
            setPosts((prev) => (prev.some((p) => p.id === newPost.id) ? prev : [newPost, ...prev]));
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSurface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginHorizontal: spacing.containerPadding,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 42
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.textMain,
    fontSize: 14
  },
  categoryContainer: {
    paddingVertical: spacing.sm
  },
  categoriesList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90
  },
  postCard: {
    marginBottom: spacing.md
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(99, 102, 241, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm
  },
  avatarAnon: {
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  authorMeta: {
    justifyContent: "center"
  },
  authorName: {
    ...typography.label,
    fontSize: 13
  },
  postTime: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 11
  },
  postTitle: {
    ...typography.h3,
    fontSize: 16,
    marginBottom: 6
  },
  postContent: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: spacing.md
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  actionCount: {
    ...typography.bodySm,
    color: colors.primaryLight,
    fontWeight: "700"
  },
  actionText: {
    ...typography.bodySm,
    color: colors.textMuted
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6
  }
});
