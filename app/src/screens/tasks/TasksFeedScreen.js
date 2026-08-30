import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert
} from "react-native";
import {
  CheckSquare,
  Search,
  Plus,
  Clock,
  MapPin,
  Coins,
  CheckCircle2,
  AlertCircle
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { tasksService } from "../../services/tasksService";
import { socketService } from "../../services/socketService";
import { HeaderBar } from "../../components/common/HeaderBar";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";
import { SkeletonLoader } from "../../components/common/SkeletonLoader";
import { EmptyState } from "../../components/common/EmptyState";
import { ErrorState } from "../../components/common/ErrorState";
import { CreateTaskModal } from "./CreateTaskModal";

const TASK_CATEGORIES = [
  "All",
  "Printout & Stationary",
  "Luggage & Moving",
  "Courier & Parcel",
  "Food Delivery",
  "Academic Help",
  "Errands"
];

export const TasksFeedScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("ALL"); // 'ALL' | 'OPEN' | 'ASSIGNED' | 'COMPLETED'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const data = await tasksService.getTasks(statusFilter, selectedCategory);
      setTasks(data || []);
    } catch (err) {
      setError(err.message || "Failed to load campus tasks.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, selectedCategory]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Real-time task events
  useEffect(() => {
    const handleTaskClaimed = (update) => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === update.taskId
            ? { ...t, status: "ASSIGNED", claimedBy: update.claimedBy }
            : t
        )
      );
    };

    const handleTaskCompleted = (update) => {
      setTasks((prev) =>
        prev.map((t) => (t.id === update.taskId ? { ...t, status: "COMPLETED" } : t))
      );
    };

    socketService.on("task:claimed", handleTaskClaimed);
    socketService.on("task:completed", handleTaskCompleted);
    return () => {
      socketService.off("task:claimed", handleTaskClaimed);
      socketService.off("task:completed", handleTaskCompleted);
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks(true);
  };

  const handleClaim = async (task) => {
    if (task.status !== "OPEN") {
      Alert.alert("Task Unavailable", "This gig has already been claimed by another student.");
      return;
    }

    try {
      await tasksService.claimTask(task.id);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "ASSIGNED" } : t))
      );
      Alert.alert("Gig Claimed!", `You've accepted this task for ₹${task.reward}. Complete it and earn your bounty!`);
    } catch (err) {
      Alert.alert("Claim Failed", err.message || "Task already claimed.");
    }
  };

  const renderTaskCard = ({ item }) => {
    const isOpen = item.status === "OPEN";
    const isAssigned = item.status === "ASSIGNED";
    const isCompleted = item.status === "COMPLETED";

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View
            style={[
              styles.statusTag,
              isOpen && styles.statusOpen,
              isAssigned && styles.statusAssigned,
              isCompleted && styles.statusCompleted
            ]}
          >
            <Text
              style={[
                styles.statusText,
                isOpen && styles.statusTextOpen,
                isAssigned && styles.statusTextAssigned,
                isCompleted && styles.statusTextCompleted
              ]}
            >
              {isOpen ? "🟢 OPEN GIG" : isAssigned ? "🟡 IN PROGRESS" : "✅ COMPLETED"}
            </Text>
          </View>

          <View style={styles.rewardBadge}>
            <Coins size={14} color={colors.ink} />
            <Text style={styles.rewardText}>₹{item.reward}</Text>
          </View>
        </View>

        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Location & Time Box */}
        <PopCard style={styles.locationBox} variant="inset">
          <View style={styles.locRow}>
            <MapPin size={13} color={colors.ink} />
            <Text style={styles.locText} numberOfLines={1}>
              {item.location || "Campus Premises"}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Clock size={13} color={colors.inkFaint} />
            <Text style={styles.timeText}>{item.timeEstimate || "20 mins"}</Text>
          </View>
        </PopCard>

        <View style={styles.cardFooter}>
          <View style={styles.authorRow}>
            <PopAvatar name={item.authorName || "Student"} size={26} />
            <Text style={styles.authorName} numberOfLines={1}>
              {item.authorName || "Student"}
            </Text>
          </View>

          {isOpen ? (
            <PopButton
              title="Claim Gig"
              onPress={() => handleClaim(item)}
              variant="sun"
              size="sm"
            />
          ) : isAssigned ? (
            <PopButton
              title="In Progress"
              disabled
              variant="surface"
              size="sm"
            />
          ) : (
            <PopButton
              title="Completed ✓"
              disabled
              variant="surface"
              size="sm"
            />
          )}
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <HeaderBar
        title="CampusTasks"
        subtitle="Quick Peer Gigs & Campus Micro-Bounties"
        accentColor={colors.sun}
        onNotificationPress={() => {}}
      />

      {/* Status Filter Tabs */}
      <View style={styles.statusRow}>
        {[
          { id: "ALL", label: "All Gigs" },
          { id: "OPEN", label: "🟢 Open" },
          { id: "ASSIGNED", label: "🟡 Active" },
          { id: "COMPLETED", label: "✅ Done" }
        ].map((s) => (
          <TouchableOpacity
            key={s.id}
            style={[styles.statusChip, statusFilter === s.id && styles.statusChipActive]}
            onPress={() => setStatusFilter(s.id)}
          >
            <Text style={[styles.statusChipText, statusFilter === s.id && styles.statusChipTextActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.categoryRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={TASK_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.sun}
              accentSoftColor={colors.sunSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Tasks List */}
      {loading && !refreshing ? (
        <SkeletonLoader count={3} />
      ) : error ? (
        <ErrorState
          title="Could not load gigs"
          message={error}
          onRetry={() => fetchTasks()}
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.sun}
              colors={[colors.sun]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<CheckSquare size={32} color={colors.sun} />}
              title="No tasks found"
              description="Post a printout pickup, parcel errand, or moving gig!"
              actionTitle="Post a Gig"
              onAction={() => setCreateModalVisible(true)}
              accentVariant="sun"
            />
          }
        />
      )}

      {/* Floating Plus */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setCreateModalVisible(true)}
      >
        <Plus size={24} color={colors.ink} />
      </TouchableOpacity>

      <CreateTaskModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={(newTask) => {
          setTasks((prev) => [newTask, ...prev]);
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
  statusRow: {
    flexDirection: "row",
    paddingHorizontal: spacing.containerPadding,
    gap: spacing.xs,
    marginTop: spacing.md
  },
  statusChip: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 7,
    borderRadius: radii.md,
    alignItems: "center"
  },
  statusChipActive: {
    backgroundColor: colors.sun,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  statusChipText: {
    ...typography.badge,
    fontSize: 11,
    color: colors.inkSoft
  },
  statusChipTextActive: {
    color: colors.ink
  },
  categoryRow: {
    paddingVertical: spacing.sm
  },
  categoryList: {
    paddingHorizontal: spacing.containerPadding
  },
  listContent: {
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 90
  },
  card: {
    marginBottom: spacing.md
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  statusTag: {
    borderWidth: 1,
    borderColor: colors.borderInk,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.pill
  },
  statusOpen: {
    backgroundColor: colors.mintSoft
  },
  statusAssigned: {
    backgroundColor: colors.sunSoft
  },
  statusCompleted: {
    backgroundColor: colors.surfaceInset
  },
  statusText: {
    ...typography.badge,
    fontSize: 10.5
  },
  statusTextOpen: {
    color: colors.mint
  },
  statusTextAssigned: {
    color: colors.ink
  },
  statusTextCompleted: {
    color: colors.inkFaint
  },
  rewardBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.sunSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  rewardText: {
    ...typography.badge,
    color: colors.ink,
    fontSize: 13
  },
  taskTitle: {
    ...typography.heading,
    fontSize: 16.5,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    marginBottom: spacing.sm
  },
  locationBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.sm,
    marginBottom: spacing.md
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
    marginRight: spacing.sm
  },
  locText: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "600",
    fontSize: 11.5
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  timeText: {
    ...typography.bodySm,
    fontSize: 11
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: spacing.sm
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    maxWidth: 160
  },
  authorName: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "700"
  },
  fab: {
    position: "absolute",
    bottom: 22,
    right: 18,
    width: 56,
    height: 56,
    borderRadius: radii.md,
    backgroundColor: colors.sun,
    borderWidth: 2,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hard
  }
});
