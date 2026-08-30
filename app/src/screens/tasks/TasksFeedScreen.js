import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import {
  CheckSquare,
  Search,
  Plus,
  Coins,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { tasksService } from "../../services/tasksService";
import { useAuth } from "../../context/AuthContext";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

const TASK_CATEGORIES = ["All", "Printout", "Food Delivery", "Luggage & Moving", "Errands", "Academic Help"];
const STATUS_FILTERS = [
  { id: "ALL", label: "All Gigs" },
  { id: "OPEN", label: "🟢 Open" },
  { id: "ASSIGNED", label: "🟡 In Progress" },
  { id: "COMPLETED", label: "✅ Done" }
];

export const TasksFeedScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Printout");
  const [reward, setReward] = useState("70");
  const [location, setLocation] = useState("Hostel Block A");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const data = await tasksService.getTasks(selectedStatus, selectedCategory);
      setTasks(data || []);
    } catch (err) {
      console.warn("Failed to load tasks:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, selectedCategory]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTasks(true);
  };

  const handleClaimTask = async (taskId) => {
    setClaimingId(taskId);
    try {
      const res = await tasksService.claimTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "ASSIGNED", claimedBy: user?.name || "You" } : t))
      );
      Alert.alert("Gig Claimed! ⚡", "You have claimed this task. Please complete it and coordinate with the requester.");
    } catch (err) {
      Alert.alert("Claim Notice", err.message || "Could not claim task.");
    } finally {
      setClaimingId(null);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksService.completeTask(taskId);
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: "COMPLETED" } : t))
      );
      Alert.alert("Task Completed! 🎉", "Bounty reward has been marked as settled.");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to mark complete.");
    }
  };

  const handleCreateTask = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Required Fields", "Please enter both task title and description.");
      return;
    }

    setSubmitting(true);
    try {
      const newTask = await tasksService.createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        reward: Number(reward) || 50,
        location: location.trim() || "Campus",
        requesterName: user?.name || "Verified Student"
      });

      setTasks((prev) => [newTask, ...prev]);
      setSubmitting(false);
      setTitle("");
      setDescription("");
      setModalOpen(false);
      Alert.alert("Success! ⚡", "Your campus gig has been posted.");
    } catch (err) {
      setSubmitting(false);
      Alert.alert("Error", err.message || "Failed to create task.");
    }
  };

  const renderTaskCard = ({ item }) => {
    const isOpen = item.status === "OPEN";
    const isAssigned = item.status === "ASSIGNED";
    const isCompleted = item.status === "COMPLETED";
    const isClaiming = claimingId === item.id;

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[
            styles.statusTag,
            isOpen && styles.statusTagOpen,
            isAssigned && styles.statusTagAssigned,
            isCompleted && styles.statusTagDone
          ]}>
            <Text style={[
              styles.statusText,
              isOpen && styles.statusTextOpen,
              isAssigned && styles.statusTextAssigned,
              isCompleted && styles.statusTextDone
            ]}>
              {isOpen ? "🟢 OPEN GIG" : isAssigned ? "🟡 IN PROGRESS" : "✅ COMPLETED"}
            </Text>
          </View>

          <View style={styles.bountyBadge}>
            <Coins size={13} color={colors.ink} />
            <Text style={styles.bountyText}>₹{item.reward || 50}</Text>
          </View>
        </View>

        <Text style={styles.taskTitle}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.metaRow}>
          <View style={styles.locationPill}>
            <MapPin size={12} color={colors.inkFaint} />
            <Text style={styles.locationText}>{item.location || "Campus"}</Text>
          </View>
          <Text style={styles.requesterText}>By {item.requesterName || "Student"}</Text>
        </View>

        <View style={styles.cardFooter}>
          {isOpen ? (
            <PopButton
              title="Claim Gig (Get Paid)"
              onPress={() => handleClaimTask(item.id)}
              loading={isClaiming}
              variant="sun"
              size="sm"
              style={{ width: "100%" }}
            />
          ) : isAssigned ? (
            <PopButton
              title="Mark as Completed"
              onPress={() => handleCompleteTask(item.id)}
              variant="surface"
              size="sm"
              style={{ width: "100%" }}
            />
          ) : (
            <View style={styles.completedBanner}>
              <CheckCircle2 size={14} color={colors.mint} />
              <Text style={styles.completedBannerText}>Bounty Settled</Text>
            </View>
          )}
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusTasks"
        subtitle="Micro-Errands & Bounties"
        accentColor={colors.sun}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Category Pills */}
      <View style={styles.categoryContainer}>
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
              accentSoft={colors.sunSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Tasks List */}
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
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalOpen(true)}
      >
        <Plus size={26} color={colors.ink} strokeWidth={2.8} />
      </TouchableOpacity>

      {/* Create Task Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Campus Gig</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.modalClose}>
                <X size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>CATEGORY</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                {["Printout", "Food Delivery", "Luggage & Moving", "Errands"].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catOption, category === cat && styles.catOptionActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[styles.catOptionText, category === cat && styles.catOptionTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>GIG TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Need color printout of 20-page report"
                placeholderTextColor={colors.inkFaint}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>DETAILS & INSTRUCTIONS</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                placeholder="Explain pickup spot, deadline, or drop location..."
                placeholderTextColor={colors.inkFaint}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>BOUNTY REWARD (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 70"
                placeholderTextColor={colors.inkFaint}
                value={reward}
                onChangeText={setReward}
                keyboardType="numeric"
              />

              <PopButton
                title="Post Gig & Offer Bounty"
                onPress={handleCreateTask}
                loading={submitting}
                variant="sun"
                size="lg"
                icon={<Send size={16} color={colors.ink} />}
                style={{ marginTop: 8, marginBottom: 20 }}
              />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas
  },
  categoryContainer: {
    paddingVertical: 12
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100
  },
  card: {
    marginBottom: 14
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  statusTag: {
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full
  },
  statusTagOpen: {
    backgroundColor: colors.mintSoft
  },
  statusTextOpen: {
    color: colors.mint
  },
  statusTagAssigned: {
    backgroundColor: colors.sunSoft
  },
  statusTextAssigned: {
    color: colors.ink
  },
  statusTagDone: {
    backgroundColor: colors.surfaceInset
  },
  statusTextDone: {
    color: colors.inkFaint
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800"
  },
  bountyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.sun,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
    ...shadows.hardSm
  },
  bountyText: {
    color: colors.ink,
    fontWeight: "900",
    fontSize: 13
  },
  taskTitle: {
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: 12
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  locationText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: "600"
  },
  requesterText: {
    ...typography.bodySm,
    color: colors.inkFaint
  },
  cardFooter: {
    marginTop: 2
  },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    backgroundColor: colors.mintSoft,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong
  },
  completedBannerText: {
    ...typography.bodySm,
    color: colors.mint,
    fontWeight: "800"
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.sun,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.lineStrong,
    ...shadows.hard,
    elevation: 6
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(23, 21, 15, 0.5)",
    justifyContent: "flex-end"
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    maxHeight: "88%",
    paddingBottom: 20,
    ...shadows.hardLg
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  modalTitle: {
    ...typography.h3,
    fontSize: 18
  },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    ...typography.label,
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  catOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surfaceInset
  },
  catOptionActive: {
    backgroundColor: colors.sun
  },
  catOptionText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.ink,
    fontWeight: "700"
  },
  catOptionTextActive: {
    color: colors.ink
  },
  input: {
    backgroundColor: colors.surfaceInset,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16
  }
});
