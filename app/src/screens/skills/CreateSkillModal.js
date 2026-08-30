import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { X, Plus, Sparkles, BookOpen } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { skillsService } from "../../services/skillsService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";

const SKILL_CATEGORIES = [
  "Tech & Coding",
  "Academics & Tutoring",
  "Design & Media",
  "Music & Arts",
  "Languages",
  "Other"
];

export const CreateSkillModal = ({ visible, onClose, onCreated }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech & Coding");
  const [type, setType] = useState("OFFER"); // 'OFFER' | 'REQUEST'
  const [hourlyRate, setHourlyRate] = useState("150");
  const [contactInfo, setContactInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("Please enter a skill or topic title.");
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
        contactInfo: contactInfo.trim() || user?.email || "",
        authorName: user?.name || "Verified Student",
        department: user?.department || "Computer Science"
      });

      setSubmitting(false);
      onCreated(newSkill);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "Failed to create skill listing.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>List a Skill or Request Help</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Listing Type Toggle */}
            <Text style={styles.fieldLabel}>LISTING TYPE</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === "OFFER" && styles.typeBtnActive]}
                onPress={() => setType("OFFER")}
              >
                <Text style={[styles.typeText, type === "OFFER" && styles.typeTextActive]}>
                  🎓 I can teach / offer
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === "REQUEST" && styles.typeBtnActive]}
                onPress={() => setType("REQUEST")}
              >
                <Text style={[styles.typeText, type === "REQUEST" && styles.typeTextActive]}>
                  🙋 I need help / tutoring
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {SKILL_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catPill, category === cat && styles.catPillActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title */}
            <Text style={styles.fieldLabel}>SKILL / SUBJECT TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Python DSA & LeetCode Tutoring"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
            />

            {/* Hourly Rate */}
            <Text style={styles.fieldLabel}>RATE / HOUR (₹) (0 for free exchange)</Text>
            <TextInput
              style={styles.input}
              placeholder="150"
              placeholderTextColor={colors.inkFaint}
              value={hourlyRate}
              onChangeText={setHourlyRate}
              keyboardType="number-pad"
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>DESCRIPTION & EXPERIENCE</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Share what topics you cover, timing flexibility, or projects..."
              placeholderTextColor={colors.inkFaint}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title="Publish Skill"
              onPress={handleCreate}
              loading={submitting}
              variant="rose"
              size="lg"
              icon={<Plus size={18} color={colors.surface} />}
              style={styles.submitBtn}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(23, 21, 15, 0.6)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 2,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: colors.borderInk,
    paddingBottom: spacing.xl,
    maxHeight: "88%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.line
  },
  headerTitle: {
    ...typography.title,
    fontSize: 20
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  body: {
    padding: spacing.containerPadding
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 11,
    marginBottom: 6
  },
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  typeBtn: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.line,
    paddingVertical: 10,
    borderRadius: radii.md,
    alignItems: "center"
  },
  typeBtnActive: {
    backgroundColor: colors.rose,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  typeText: {
    ...typography.badge,
    color: colors.inkSoft,
    fontSize: 12
  },
  typeTextActive: {
    color: colors.surface
  },
  catGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.line
  },
  catPillActive: {
    backgroundColor: colors.rose,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  catText: {
    ...typography.badge,
    fontSize: 11.5,
    color: colors.inkSoft
  },
  catTextActive: {
    color: colors.surface
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.ink,
    fontSize: 14,
    marginBottom: spacing.lg,
    ...shadows.hardSm
  },
  textArea: {
    minHeight: 80
  },
  errorText: {
    ...typography.bodySm,
    color: colors.rose,
    fontWeight: "700",
    marginBottom: spacing.md
  },
  submitBtn: {
    marginBottom: spacing.xl
  }
});
