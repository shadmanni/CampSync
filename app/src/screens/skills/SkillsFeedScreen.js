import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity,
  TextInput, Modal, ScrollView, RefreshControl
} from "react-native";
import {
  Sparkles, Plus, BookOpen, Users, X, Send
} from "lucide-react-native";
import { colors, shadows, borders, radii, spacing, typography } from "../../theme/theme";
import { skillsService } from "../../services/skillsService";
import { socketService } from "../../services/socketService";
import { useAuth } from "../../context/AuthContext";
import { PopCard } from "../../components/common/PopCard";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";
import { PopHeader } from "../../components/common/PopHeader";
import { PopAvatar } from "../../components/common/PopAvatar";
import { EmptyState } from "../../components/common/EmptyState";
import { SkeletonCard } from "../../components/common/SkeletonLoader";

const ACCENT = colors.rose;
const CATEGORIES = ["All", "Tech & Coding", "Academics & Tutoring", "Design & Media", "Music & Arts", "Languages", "Other"];
const TYPES = ["All", "OFFER", "REQUEST"];

export const SkillsFeedScreen = () => {
  const { user } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState("All");
  const [type, setType] = useState("All");
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await skillsService.getSkills(category, type);
      setSkills(data?.skills || data || []);
    } catch (err) {
      console.warn("[SkillsFeed] Load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [category, type]);

  useEffect(() => { load(); }, [load]);
  const onRefresh = () => { setRefreshing(true); load(); };

  // Real-time: listen for new skills from other clients
  useEffect(() => {
    socketService.connect();
    const handler = (skill) => {
      setSkills(prev => {
        if (prev.some(s => s.id === skill.id)) return prev;
        return [skill, ...prev];
      });
    };
    socketService.on("skill:created", handler);
    return () => socketService.off("skill:created", handler);
  }, []);

  const handleCreate = async (formData) => {
    try {
      const created = await skillsService.createSkill(formData);
      setSkills(prev => [created, ...prev]);
      setCreateOpen(false);
    } catch (err) {
      console.warn("[SkillsFeed] Create error:", err);
    }
  };

  const renderSkill = ({ item }) => {
    const isOffer = (item.type || "").toUpperCase() === "OFFER" || item.type === "Offer";
    const pricingDisplay = item.pricing || (item.rate ? `₹${item.rate}/hr` : "Free Exchange");
    const author = item.userName || item.authorName || "Student";

    return (
      <PopCard style={styles.skillCard}>
        <View style={styles.topRow}>
          <View style={[styles.typeBadge, {
            backgroundColor: isOffer ? colors.mintSoft : colors.sunSoft,
          }]}>
            <Text style={[styles.typeBadgeText, {
              color: isOffer ? colors.mint : colors.sun,
            }]}>{isOffer ? "⚡ Offering" : "🙋 Requesting"}</Text>
          </View>
          <View style={styles.rateBadge}>
            <Text style={styles.rateText}>{pricingDisplay}</Text>
          </View>
        </View>

        <Text style={styles.skillTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.skillDesc} numberOfLines={3}>{item.description}</Text>

        <View style={styles.metaRow}>
          <PopAvatar name={author} size={24} />
          <Text style={styles.authorText}>{author}</Text>
          {item.category && (
            <View style={styles.catPill}>
              <Text style={styles.catPillText}>{item.category}</Text>
            </View>
          )}
        </View>

        <PopButton
          title={item.contact ? `Contact: ${item.contact}` : "Contact Peer"}
          accent={ACCENT}
          icon={Send}
          variant="outline"
          block
          size="sm"
        />
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusSkills"
        subtitle={`${skills.length} peer tutor${skills.length !== 1 ? "s" : ""}`}
        accent={ACCENT}
        icon={Sparkles}
      />

      {/* Type Toggle */}
      <View style={styles.toggleRow}>
        {TYPES.map(t => (
          <PopPill key={t} label={t} active={type === t} onPress={() => setType(t)} accent={ACCENT} />
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
          data={skills}
          keyExtractor={item => item._id || item.id}
          renderItem={renderSkill}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />}
          ListEmptyComponent={
            <EmptyState icon={BookOpen} title="No skills listed yet" hint="Offer tutoring or request help from peers." />
          }
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setCreateOpen(true)} activeOpacity={0.85}>
        <Plus size={24} color={colors.onAccent} strokeWidth={2.8} />
      </TouchableOpacity>

      <CreateSkillModal visible={createOpen} onClose={() => setCreateOpen(false)} onSubmit={handleCreate} />
    </View>
  );
};

function CreateSkillModal({ visible, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", category: "Tech & Coding", type: "OFFER", pricing: "", contact: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (visible) setForm({ title: "", description: "", category: "Tech & Coding", type: "OFFER", pricing: "", contact: "" });
  }, [visible]);

  const submit = async () => {
    if (busy || !form.title.trim() || !form.contact.trim()) return;
    setBusy(true);
    await onSubmit(form);
    setBusy(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Post a Skill</Text>
            <TouchableOpacity onPress={onClose}><X size={22} color={colors.ink} /></TouchableOpacity>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={[typography.label, { marginBottom: 8 }]}>Type</Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
              <PopPill label="Offering" active={form.type === "OFFER"} onPress={() => setForm(f => ({ ...f, type: "OFFER" }))} accent={colors.mint} />
              <PopPill label="Requesting" active={form.type === "REQUEST"} onPress={() => setForm(f => ({ ...f, type: "REQUEST" }))} accent={colors.sun} />
            </View>

            <Text style={[typography.label, { marginBottom: 8 }]}>Skill title</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. Python tutoring" placeholderTextColor={colors.inkFaint} value={form.title} onChangeText={t => setForm(f => ({ ...f, title: t }))} />

            <Text style={[typography.label, { marginBottom: 8 }]}>Description</Text>
            <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: "top" }]} multiline placeholder="What you can teach or need help with" placeholderTextColor={colors.inkFaint} value={form.description} onChangeText={t => setForm(f => ({ ...f, description: t }))} />

            <Text style={[typography.label, { marginBottom: 8 }]}>Pricing (e.g. ₹200/hr or Free)</Text>
            <TextInput style={styles.modalInput} placeholder="₹200/hr" placeholderTextColor={colors.inkFaint} value={form.pricing} onChangeText={t => setForm(f => ({ ...f, pricing: t }))} />

            <Text style={[typography.label, { marginBottom: 8 }]}>Contact info *</Text>
            <TextInput style={styles.modalInput} placeholder="Email, WhatsApp, or hostel room" placeholderTextColor={colors.inkFaint} value={form.contact} onChangeText={t => setForm(f => ({ ...f, contact: t }))} />

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
            <PopButton title={busy ? "Posting…" : "Post Skill"} accent={ACCENT} icon={Sparkles} onPress={submit} loading={busy} disabled={!form.title.trim() || !form.contact.trim()} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  toggleRow: { flexDirection: "row", paddingHorizontal: spacing.containerPadding, paddingTop: 12, gap: 8 },
  pillsRow: { paddingHorizontal: spacing.containerPadding, paddingVertical: 10, gap: 8 },
  listContent: { paddingHorizontal: spacing.containerPadding, paddingBottom: 100, gap: 14 },
  skillCard: { padding: 18 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, ...borders.card },
  typeBadgeText: { fontSize: 12, fontWeight: "700" },
  rateBadge: { backgroundColor: colors.surfaceInset, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.pill, ...borders.card },
  rateText: { fontSize: 13, fontWeight: "800", color: colors.ink, fontVariant: ["tabular-nums"] },
  skillTitle: { fontSize: 16, fontWeight: "700", color: colors.ink, marginBottom: 6, lineHeight: 22 },
  skillDesc: { fontSize: 14, color: colors.inkSoft, lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  authorText: { fontSize: 12, color: colors.inkFaint, fontWeight: "600" },
  catPill: { marginLeft: "auto", backgroundColor: colors.roseSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill },
  catPillText: { fontSize: 10, fontWeight: "700", color: ACCENT },
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
