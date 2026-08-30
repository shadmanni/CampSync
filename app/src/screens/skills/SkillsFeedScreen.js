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
  Sparkles,
  Search,
  Plus,
  BookOpen,
  User,
  Check,
  X,
  Send,
  MessageCircle
} from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { skillsService } from "../../services/skillsService";
import { useAuth } from "../../context/AuthContext";
import { PopHeader } from "../../components/common/PopHeader";
import { PopCard } from "../../components/common/PopCard";
import { PopPill } from "../../components/common/PopPill";
import { PopButton } from "../../components/common/PopButton";
import { PopAvatar } from "../../components/common/PopAvatar";

const SKILL_CATEGORIES = ["All", "Tech & Coding", "Academics", "Design", "Music", "Languages"];
const TYPE_FILTERS = ["All Listings", "Offering Skill", "Requesting Help"];

export const SkillsFeedScreen = ({ navigation }) => {
  const { user } = useAuth();

  const [skills, setSkills] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All Listings");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech & Coding");
  const [type, setType] = useState("OFFER");
  const [hourlyRate, setHourlyRate] = useState("300");
  const [submitting, setSubmitting] = useState(false);

  const fetchSkills = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const typeParam = selectedType === "Offering Skill" ? "OFFER" : selectedType === "Requesting Help" ? "REQUEST" : "ALL";
      const data = await skillsService.getSkills(selectedCategory, typeParam, searchQuery);
      setSkills(data || []);
    } catch (err) {
      console.warn("Failed to load skills:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, selectedType, searchQuery]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSkills(true);
  };

  const handleCreateSkill = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert("Required Fields", "Please enter both skill title and description.");
      return;
    }

    setSubmitting(true);
    try {
      const newSkill = await skillsService.createSkill({
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        hourlyRate: Number(hourlyRate) || 0,
        creatorName: user?.name || "Verified Student"
      });

      setSkills((prev) => [newSkill, ...prev]);
      setSubmitting(false);
      setTitle("");
      setDescription("");
      setModalOpen(false);
      Alert.alert("Success! 🎓", "Your skill listing is now visible to the campus.");
    } catch (err) {
      setSubmitting(false);
      Alert.alert("Error", err.message || "Failed to publish skill.");
    }
  };

  const renderSkillCard = ({ item }) => {
    const isOffer = item.type === "OFFER";

    return (
      <PopCard style={styles.card}>
        <View style={styles.cardTop}>
          <View style={[styles.typeBadge, !isOffer && styles.typeBadgeRequest]}>
            <Text style={[styles.typeBadgeText, !isOffer && styles.typeBadgeRequestText]}>
              {isOffer ? "🎓 OFFERING TUTORING" : "🙋 REQUESTING HELP"}
            </Text>
          </View>
          <Text style={styles.rateText}>₹{item.hourlyRate || 250}/hr</Text>
        </View>

        <Text style={styles.skillTitle}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>

        <View style={styles.cardFooter}>
          <View style={styles.tutorRow}>
            <PopAvatar name={item.creatorName || "Student"} size={32} accentColor={colors.rose} />
            <Text style={styles.tutorName}>{item.creatorName || "Verified Peer"}</Text>
          </View>

          <PopButton
            title="Connect"
            onPress={() => Alert.alert("Contact Peer", `Reach out to ${item.creatorName || "this student"} for tutoring details.`)}
            variant="rose"
            size="sm"
            icon={<MessageCircle size={13} color="#FFFFFF" />}
          />
        </View>
      </PopCard>
    );
  };

  return (
    <View style={styles.container}>
      <PopHeader
        title="CampusSkills"
        subtitle="Peer Tutoring & Learning"
        accentColor={colors.rose}
        onProfilePress={() => navigation.navigate("Profile")}
      />

      {/* Search Input */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputWrapper}>
          <Search size={16} color={colors.inkFaint} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search skills, tutors, languages..."
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
          data={SKILL_CATEGORIES}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <PopPill
              label={item}
              active={selectedCategory === item}
              accentColor={colors.rose}
              accentSoft={colors.roseSoft}
              onPress={() => setSelectedCategory(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16 }}
        />
      </View>

      {/* Skills List */}
      <FlatList
        data={skills}
        keyExtractor={(item) => item.id}
        renderItem={renderSkillCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.rose}
            colors={[colors.rose]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setModalOpen(true)}
      >
        <Plus size={26} color="#FFFFFF" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* Create Skill Modal */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share or Request Skill</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={styles.modalClose}>
                <X size={18} color={colors.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }} keyboardShouldPersistTaps="handled">
              <Text style={styles.label}>LISTING TYPE</Text>
              <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                <TouchableOpacity
                  style={[styles.typeOption, type === "OFFER" && styles.typeOptionActive]}
                  onPress={() => setType("OFFER")}
                >
                  <Text style={[styles.typeOptionText, type === "OFFER" && styles.typeOptionTextActive]}>
                    🎓 Offering Tutoring
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeOption, type === "REQUEST" && styles.typeOptionActive]}
                  onPress={() => setType("REQUEST")}
                >
                  <Text style={[styles.typeOptionText, type === "REQUEST" && styles.typeOptionTextActive]}>
                    🙋 Requesting Help
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>SKILL TITLE</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Python, React & Data Structures Tutoring"
                placeholderTextColor={colors.inkFaint}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>DESCRIPTION</Text>
              <TextInput
                style={[styles.input, { minHeight: 90 }]}
                placeholder="Share your experience, syllabus covered, or what help you need..."
                placeholderTextColor={colors.inkFaint}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />

              <Text style={styles.label}>HOURLY RATE (₹/HR)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 300"
                placeholderTextColor={colors.inkFaint}
                value={hourlyRate}
                onChangeText={setHourlyRate}
                keyboardType="numeric"
              />

              <PopButton
                title="Publish Skill"
                onPress={handleCreateSkill}
                loading={submitting}
                variant="rose"
                size="lg"
                icon={<Send size={16} color="#FFFFFF" />}
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
  card: {
    marginBottom: 14
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  typeBadge: {
    backgroundColor: colors.roseSoft,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radii.full
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.rose
  },
  typeBadgeRequest: {
    backgroundColor: colors.violetSoft
  },
  typeBadgeRequestText: {
    color: colors.violet
  },
  rateText: {
    ...typography.label,
    fontSize: 14,
    color: colors.rose
  },
  skillTitle: {
    ...typography.h3,
    fontSize: 17,
    marginBottom: 4
  },
  description: {
    ...typography.body,
    lineHeight: 20,
    marginBottom: 12
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1.5,
    borderTopColor: colors.line,
    paddingTop: 10
  },
  tutorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  tutorName: {
    ...typography.bodySm,
    color: colors.ink,
    fontWeight: "700"
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.rose,
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
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    backgroundColor: colors.surfaceInset,
    alignItems: "center",
    ...shadows.hardSm
  },
  typeOptionActive: {
    backgroundColor: colors.rose
  },
  typeOptionText: {
    ...typography.label,
    fontSize: 12,
    color: colors.ink
  },
  typeOptionTextActive: {
    color: "#FFFFFF"
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
