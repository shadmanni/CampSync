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
  Shield,
  Sparkles,
  TrendingUp
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { socketService } from "../../services/socketService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
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

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await connectService.getPosts(selectedCategory, searchQuery);
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

  useEffect(() => {
    const handleNewPost = (newPost) => {
      setPosts((prevPosts) => {
        if (prevPosts.some((p) => p.id === newPost.id)) return prevPosts;
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

  const handleUpvote = async (postId) => {
    const originalPosts = [...posts];

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
      console.warn("[Connect] Upvote failed, rolled back:", err.message);
    }
  };

  const renderPostCard = ({ item }) => {
    const isAnonymous = item.isAnonymous;
    const authorName = item.authorName || "Verified Student";
    const commentsCount = Array.isArray(item.comments) ? item.comments.length : 0;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate("PostDetail", { post: item })}
      >
        <PopCard style={styles.postCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
              <PopAvatar name={authorName} anonymous={isAnonymous} size={36} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.postTime}>{item.createdAt || "Recently"}</Text>
              </View>
            </View>

            <View style={[styles.categoryBadge, { backgroundColor: colors.violetSoft }]}>
              <Text style={styles.categoryBadgeText}>{item.category || "General"}</Text>
            </View>
          </View>

          {/* Title & Body */}
          <Text style={styles.postTitle}>{item.title}</Text>
          <Text style={styles.postContent} numberOfLines={3}>
            {item.content}
          </Text>

          {/* Footer Actions */}
          <View style={styles.cardFooter}>
            <TouchableOpacity
              style={styles.upvoteBtn}
              onPress={() => handleUpvote(item.id)}
              activeOpacity={0.7}
            >
              <ThumbsUp size={14} color={colors.violet} />
              <Text style={styles.upvoteCount}>{item.upvotes || 0}</Text>
            </TouchableOpacity>

            <View style={styles.repliesBtn}>
              <MessageSquare size={14} color={colors.inkSoft} />
              <Text style={styles.repliesText}>{commentsCount} replies</Text>
            </View>
          </View>
        </PopCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusConnect"
        subtitle="Verified Student Community Feed"
        accentColor={colors.violet}
        onNotificationPress={() => {}}
      />

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Search size={16} color={colors.inkFaint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions or questions..."
          placeholderTextColor={colors.inkFaint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Category Pills */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.violet}
              accentSoftColor={colors.violetSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Feed Content */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load discussions"
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
              tintColor={colors.violet}
              colors={[colors.violet]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<MessageSquare size={32} color={colors.violet} />}
              title="No discussions found"
              description={
                searchQuery
                  ? `No posts matched "${searchQuery}". Try a different keyword or category.`
                  : "Be the first student to post a question or announcement!"
              }
              actionTitle="Create Discussion"
              onAction={() => setModalVisible(true)}
              accentVariant="violet"
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
        <Plus size={24} color={colors.surface} />
      </TouchableOpacity>

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
    backgroundColor: colors.canvas
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    marginHorizontal: spacing.containerPadding,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    height: 44,
    ...shadows.hardSm
  },
  searchIcon: {
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "500"
  },
  categoryRow: {
    paddingVertical: spacing.md
  },
  categoryList: {
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
  authorMeta: {
    marginLeft: spacing.sm
  },
  authorName: {
    ...typography.badge,
    fontSize: 13,
    color: colors.ink
  },
  postTime: {
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
    fontSize: 16,
    marginBottom: 4
  },
  postContent: {
    ...typography.body,
    marginBottom: spacing.md
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: spacing.sm
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  upvoteCount: {
    ...typography.badge,
    color: colors.violet,
    fontSize: 12
  },
  repliesBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  repliesText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "600"
  },
  fab: {
    position: "absolute",
    bottom: 22,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.violet,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hard
  }
});
