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
  Sparkles
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { socketService } from "../../services/socketService";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopAvatar } from "../../components/common/PopAvatar";
import { CreatePostModal } from "./CreatePostModal";

const CATEGORIES = ["All", "Academic", "General", "Lost & Found"];

export const ConnectFeedScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchPosts = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await connectService.getPosts(selectedCategory, searchQuery);
      setPosts(data || []);
    } catch (err) {
      console.warn("Failed to load discussions:", err.message);
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
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p))
    );

    try {
      const res = await connectService.upvotePost(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, upvotes: res.upvotes } : p))
      );
    } catch (err) {
      setPosts(originalPosts);
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
        <PopCard style={styles.postCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.authorRow}>
              <PopAvatar name={authorName} anonymous={isAnonymous} size={36} accentColor={colors.violet} />
              <View style={styles.authorMeta}>
                <Text style={styles.authorName}>{authorName}</Text>
                <Text style={styles.postTime}>{item.createdAt || "Recently"}</Text>
              </View>
            </View>

            <View style={styles.tagBadge}>
              <Text style={styles.tagText}>{item.category || "General"}</Text>
            </View>
          </View>

          {/* Title & Content */}
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
              <Text style={styles.upvoteText}>{item.upvotes || 0}</Text>
            </TouchableOpacity>

            <View style={styles.commentCountRow}>
              <MessageSquare size={14} color={colors.inkFaint} />
              <Text style={styles.commentCountText}>{commentsCount} replies</Text>
            </View>
          </View>
        </PopCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusConnect"
        subtitle="Verified Community Feed"
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color={colors.inkFaint} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions or questions..."
            placeholderTextColor={colors.inkFaint}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
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
              accentSoft={colors.violetSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Feed List */}
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
      />

      {/* FAB (Violet Pop) */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalVisible(true)}
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
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
  searchRow: {
    paddingHorizontal: 16,
    paddingTop: 12
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    height: 44,
    ...shadows.hardSm
  },
  searchInput: {
    flex: 1,
    color: colors.ink,
    fontSize: 14,
    fontWeight: "600"
  },
  categoryContainer: {
    paddingVertical: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  postCard: {
    marginBottom: 14
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  authorMeta: {
    justifyContent: "center"
  },
  authorName: {
    ...typography.label,
    fontSize: 14,
    color: colors.ink
  },
  postTime: {
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
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  postContent: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: 10
  },
  upvoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.violetSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
    ...shadows.hardSm
  },
  upvoteText: {
    ...typography.bodySm,
    color: colors.violet,
    fontWeight: "800"
  },
  commentCountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  commentCountText: {
    ...typography.bodySm,
    color: colors.inkFaint
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.violet,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.lineStrong,
    ...shadows.hard,
    elevation: 6
  }
});
