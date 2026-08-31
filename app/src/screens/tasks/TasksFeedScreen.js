import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, RefreshControl
} from "react-native";
import {
  CheckSquare, Plus, MapPin, Clock, Zap, X, Award
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { tasksService } from "../../services/tasksService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";

const ACCENT = colors.sun;
const CATEGORIES = ["All", "Printout & Stationary", "Luggage & Moving", "Courier & Parcel", "Food Delivery", "Academic Help", "Errands"];
const STATUSES = ["All", "OPEN", "ASSIGNED", "COMPLETED"];

export const TasksFeedScreen = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await tasksService.getTasks(status, category);
      setTasks(data?.tasks || data || []);
    } catch (err) {
      console.warn("[TasksFeed] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, status]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  // Real-time: listen for task events from other clients
  useEffect(() => {
    socketService.connect();
    const onCreated = (task) => {
      setTasks(prev => {
        if (prev.some(t => t.id === task.id)) return prev;
        return [task, ...prev];
      });
    };
    const onAssigned = ({ taskId, status, assignedToName }) => {
      setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, status, assignedToName } : t));
    };
    const onCompleted = ({ taskId, status }) => {
      setTasks(prev => prev.map(t => (t.id || t._id) === taskId ? { ...t, status } : t));
    };
    socketService.on("task:created", onCreated);
    socketService.on("task:assigned", onAssigned);
    socketService.on("task:completed", onCompleted);
    return () => {
      socketService.off("task:created", onCreated);
      socketService.off("task:assigned", onAssigned);
      socketService.off("task:completed", onCompleted);
    };
  }, []);

  const handleAccept = async (task) => {
    const id = task._id || task.id;
    try {
      const res = await tasksService.acceptTask(id);
      setTasks(prev => prev.map(t => (t._id || t.id) === id ? { ...t, status: "ASSIGNED", ...(res?.task || res) } : t));
    } catch (err) {
      console.warn("[TasksFeed] Accept error:", err);
    }
  };

  const handleCreate = async (formData) => {
    try {
      const created = await tasksService.createTask(formData);
      setTasks(prev => [created, ...prev]);
      setCreateOpen(false);
    } catch (err) {
      console.warn("[TasksFeed] Create error:", err);
    }
  };

  const renderTask = ({ item }) => (
    <PopCard accent={ACCENT} style={styles.taskCard}>
      <View style={styles.topRow}>
        {item.category && (
          <View style={[styles.badge, { backgroundColor: colors.sunSoft }]}>
            <Text style={[styles.badgeText, { color: ACCENT }]}>{item.category}</Text>
          </View>
        )}
        <View style={[styles.statusBadge, {
          backgroundColor: item.status === "OPEN" ? colors.mintSoft
            : item.status === "ASSIGNED" ? colors.skySoft
            : colors.surfaceInset,
        }]}>
          <Text style={[styles.statusText, {
            color: item.status === "OPEN" ? colors.mint
              : item.status === "ASSIGNED" ? colors.sky
              : colors.inkFaint,
          }]}>{item.status || "OPEN"}</Text>
        </View>
      </View>

      <Text style={styles.taskTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.taskDesc} numberOfLines={3}>{item.description}</Text>

      {/* Meta info */}
      <View style={styles.metaRow}>
        {(item.pickupLocation || item.dropLocation) && (
          <View style={styles.metaItem}>
            <MapPin size={12} color={colors.inkFaint} strokeWidth={2.4} />
            <Text style={styles.metaText}>{item.pickupLocation}{item.dropLocation ? ` → ${item.dropLocation}` : ''}</Text>
          </View>
        )}
        {item.deadline && (
          <View style={styles.metaItem}>
            <Clock size={12} color={colors.inkFaint} strokeWidth={2.4} />
            <Text style={styles.metaText}>{item.deadline}</Text>
          </View>
        )}
      </View>

      {/* Reward + CTA */}
      <View style={styles.rewardRow}>
        <View style={styles.rewardBlock}>
          <Award size={16} color={ACCENT} strokeWidth={2.2} />
          <Text style={styles.rewardAmount}>₹{item.reward}</Text>
          <Text style={styles.rewardLabel}>bounty</Text>
        </View>

        <PopButton
          title={item.status === "OPEN" ? "Accept Gig" : item.status === "ASSIGNED" ? "In Progress" : "Done"}
          accent={ACCENT}
          icon={item.status === "OPEN" ? Zap : CheckSquare}
          variant={item.status === "OPEN" ? "primary" : "ghost"}
          size="sm"
          onPress={() => handleAccept(item)}
          disabled={item.status !== "OPEN"}
        />
      </View>
    </PopCard>
  );

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusTasks"
        subtitle={`${tasks.filter(t => t.status === "OPEN" || !t.status).length} open gig${tasks.filter(t => t.status === "OPEN" || !t.status).length !== 1 ? "s" : ""}`}
        accent={ACCENT}
        icon={CheckSquare}
      />

      {/* Status Pills */}
      <View style={styles.toggleRow}>
        {STATUSES.map(s => (
          <PopPill key={s} label={s} active={status === s} onPress={() => setStatus(s)} accent={ACCENT} />
        ))}
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsRow}>
        {CATEGORIES.map(cat => (
          <PopPill key={cat} label={cat} active={category === cat} onPress={() => setCategory(cat)} accent={ACCENT} />
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ padding: spacing.containerPadding, gap: 16 }}>
          <SkeletonCard /><SkeletonCard />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item._id || item.id}
          renderItem={renderTask}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={CheckSquare} title="No tasks posted yet" hint="Post a campus errand and set a bounty — someone will grab it." />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setCreateOpen(true)} activeOpacity={0.85}>
        <Plus size={24} color={colors.ink} strokeWidth={2.8} />
      </TouchableOpacity>

      <CreateTaskModal visible={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
    </View>
  );
};

function CreateTaskModal({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Errands", reward: "", pickupLocation: "", dropLocation: "", deadline: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setForm({ title: "", description: "", category: "Errands", reward: "", pickupLocation: "", dropLocation: "", deadline: "" });
  }, [visible]);

  const submit = async () => {
    if (busy || !form.title.trim() || !form.reward) return;
    setBusy(true);
    await onSubmit({ ...form, reward: Number(form.reward) });
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post a Task</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={colors.ink} /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[typography.label, { marginBottom: 8 }]}>What needs doing?</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Pick up my library books" placeholderTextColor={colors.inkFaint} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />

            <Text style={[typography.label, { marginBottom: 8 }]}>Details</Text>
            <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: "top" }]} multiline placeholder="Explain the task clearly" placeholderTextColor={colors.inkFaint} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Bounty (₹)</Text>
                <TextInput style={styles.modalInput} keyboardType="number-pad" placeholder="100" placeholderTextColor={colors.inkFaint} value={form.reward} onChangeText={t => setForm(f => ({ ...f, reward: t }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Pickup from</Text>
                <TextInput style={styles.modalInput} placeholder="Central Library" placeholderTextColor={colors.inkFaint} value={form.pickupLocation} onChangeText={t => setForm(f => ({ ...f, pickupLocation: t }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.label, { marginBottom: 8 }]}>Drop at</Text>
                <TextInput style={styles.modalInput} placeholder="Block A Desk" placeholderTextColor={colors.inkFaint} value={form.dropLocation} onChangeText={t => setForm(f => ({ ...f, dropLocation: t }))} />
              </View>
            </View>

            <Text style={[typography.label, { marginBottom: 8 }]}>Deadline</Text>
            <TextInput style={styles.modalInput} placeholder="Today by 5 PM" placeholderTextColor={colors.inkFaint} value={form.deadline} onChangeText={t => setForm(f => ({ ...f, deadline: t }))} />

            <Text style={[typography.label, { marginBottom: 8 }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: "row", gap: 6 }}>
                {CATEGORIES.filter(c => c !== "All").map(c => (
                  <PopPill key={c} label={c} active={form.category === c} onPress={() => setForm(f => ({ ...f, category: c }))} accent={ACCENT} />
                ))}
              </View>
            </ScrollView>
          </ScrollView>
          <View style={styles.modalActions}>
            <PopButton title="Cancel" variant="ghost" onPress={onClose} />
            <PopButton title={busy ? "Posting…" : "Post the Task"} accent={ACCENT} icon={Zap} onPress={submit} loading={busy} disabled={!form.title.trim() || !form.reward} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  toggleRow: { flexDirection: "row", paddingHorizontal: spacing.containerPadding, paddingTop: 12, gap: 8, flexWrap: "wrap" },
  pillsRow: { paddingHorizontal: spacing.containerPadding, paddingVertical: 10, gap: 8 },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, gap: 14 },
  taskCard: { padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, ...borders.card },
  badgeText: { fontSize: 11, fontWeight: "700" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, ...borders.card },
  statusText: { fontSize: 11, fontWeight: "700" },
  taskTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  taskDesc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: "row", gap: 16, marginBottom: 14, flexWrap: "wrap" },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 11, color: colors.inkFaint },
  rewardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rewardBlock: { flexDirection: "row", alignItems: "center", gap: 6 },
  rewardAmount: { fontSize: 20, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  rewardLabel: { fontSize: 11, color: colors.inkFaint },
  fab: {
    position: "absolute", bottom: 24, right: 20,
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: ACCENT, ...borders.card, ...shadows.hard,
    alignItems: "center", justifyContent: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(23,21,15,0.5)", justifyContent: "flex-end" },
  modalContent: {
    backgroundColor: colors.surface, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl,
    ...borders.card, borderBottomWidth: 0,
    paddingHorizontal: spacing.containerPadding, paddingTop: 20, paddingBottom: 32,
    maxHeight: "85%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: "800", color: colors.ink },
  modalInput: {
    backgroundColor: colors.surfaceInset, borderRadius: radii.sm, ...borders.card,
    padding: 14, fontSize: 15, color: colors.ink, marginBottom: 14,
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 12 },
});
