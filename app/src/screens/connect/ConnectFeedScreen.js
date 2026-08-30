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
  Share2
} from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { socketService } from "../../services/socketService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { GlassCard } from "../../components/common/GlassCard";
import { CategoryPill } from "../../components/common/CategoryPill";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { CreatePostModal } from "./CreatePostModal";

const CATEGORIES = ["All Topics", "Academic", "General", "Lost & Found"];

export const ConnectFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
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
      const categoryParam = selectedCategory === "All Topics" ? "All" : selectedCategory;
      const data = await connectService.getPosts(categoryParam, searchQuery);
      setPosts(data || []);
    } catch (err) {
      setError(err.message || "Failed to load discussions.");
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
        if (prevPosts.some((p) => p.id === newPost.id)) return prevPosts;

        if (
          selectedCategory !== "All Topics" &&
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

  // Optimistic Upvote with Rollback on Error
  const handleUpvote = async (postId) => {
    const originalPosts = [...posts];

    // 1. Optimistic update
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p
      )
    );

    try {
      const result = await connectService.upvotePost(postId);
      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.id === postId ? { ...p, upvotes: result.upvotes } : p
        )
      );
    } catch (err) {
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
          {/* Header Row */}
          <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
              <View style={[styles.avatar, isAnonymous && styles.avatarAnon]}>
                {isAnonymous ? (
                  <Shield size={16} color={colors.textSubtle} />
                ) : (
                  <Text style={styles.avatarLetter}>
                    {authorName.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.postTime}>{item.createdAt || "Recently"}</Text>
              </View>
            </View>

            <View style={[
              styles.categoryTag,
              item.category === "Academic" && styles.catAcademic,
              item.category === "Lost & Found" && styles.catLost
            ]}>
              <Text style={[
                styles.categoryTagText,
                item.category === "Academic" && styles.catAcademicText,
                item.category === "Lost & Found" && styles.catLostText
              ]}>
                {item.category || "General"}
              </Text>
            </View>
          </View>

          {/* Title & Body */}
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {item.content}
          </Text>

          {/* Card Footer Actions */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.upvoteButton}
              onPress={() => handleUpvote(item.id)}
              activeOpacity={0.7}
            >
              <ThumbsUp size={15} color={colors.primary} />
              <Text style={styles.upvoteCount}>{item.upvotes || 0}</Text>
            </TouchableOpacity>

            <View style={styles.replyButton}>
              <MessageSquare size={15} color={colors.textSubtle} />
              <Text style={styles.replyText}>{commentsCount} replies</Text>
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
        <Search size={17} color={colors.textSubtle} style={styles.searchIcon} />
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

      {/* Feed List / States */}
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
              tintColor={colors.primary}
              colors={[colors.primary, colors.secondary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<MessageSquare size={32} color={colors.primary} />}
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

      {/* Floating Action Button (Warm Orange #FF6F3C) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={26} color={colors.textInverse} />
      </TouchableOpacity>

      {/* Create Post Modal */}
      <CreatePostModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={(newPost) => {
          if (
            selectedCategory === "All Topics" ||
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
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 46,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14
  },
  categoryContainer: {
    paddingVertical: spacing.md
  },
  categoriesList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 100
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 14
  },
  authorMeta: {
    justifyContent: "center"
  },
  authorName: {
    ...typography.label,
    fontSize: 14,
    color: colors.textPrimary
  },
  postTime: {
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
  catAcademic: {
    backgroundColor: "rgba(45, 27, 105, 0.08)"
  },
  catAcademicText: {
    color: colors.primary
  },
  catLost: {
    backgroundColor: colors.accentOrangeLight
  },
  catLostText: {
    color: colors.secondary
  },
  postTitle: {
    ...typography.h3,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 6
  },
  postContent: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 21,
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
  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.bgDim,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full
  },
  upvoteCount: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "700"
  },
  replyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  replyText: {
    ...typography.bodySm,
    color: colors.textSubtle
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.secondary, // Warm Orange #FF6F3C
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6
  }
});
