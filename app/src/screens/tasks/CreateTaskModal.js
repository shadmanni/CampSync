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
import { X, Plus, Coins, Clock } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { tasksService } from "../../services/tasksService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";

const TASK_CATEGORIES = [
  "Printout & Stationary",
  "Luggage & Moving",
  "Courier & Parcel",
  "Food Delivery",
  "Academic Help",
  "Errands"
];

export const CreateTaskModal = ({ visible, onClose, onCreated }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Printout & Stationary");
  const [reward, setReward] = useState("70");
  const [location, setLocation] = useState("Hostel Block B to Library");
  const [timeEstimate, setTimeEstimate] = useState("20 mins");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("Please enter a task title.");
      return;
    }
    const numReward = Number(reward);
    if (isNaN(numReward) || numReward <= 0) {
      setErrorMsg("Please enter a valid reward amount in ₹.");
      return;
    }

    setSubmitting(true);
    try {
      const newTask = await tasksService.createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        reward: numReward,
        location: location.trim(),
        timeEstimate: timeEstimate.trim(),
        authorName: user?.name || "Verified Student",
        department: user?.department || "Computer Science"
      });

      setSubmitting(false);
      onCreated(newTask);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "Failed to post gig.");
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
            <Text style={styles.headerTitle}>Post a Campus Micro-Task</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Category */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {TASK_CATEGORIES.map((cat) => (
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
            <Text style={styles.fieldLabel}>TASK TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Need 15-page Lab Report Printed & Bound"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
            />

            {/* Reward & Time */}
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>REWARD BOUNTY (₹)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="70"
                  placeholderTextColor={colors.inkFaint}
                  value={reward}
                  onChangeText={setReward}
                  keyboardType="number-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>TIME ESTIMATE</Text>
                <TextInput
                  style={styles.input}
                  placeholder="20 mins"
                  placeholderTextColor={colors.inkFaint}
                  value={timeEstimate}
                  onChangeText={setTimeEstimate}
                />
              </View>
            </View>

            {/* Location */}
            <Text style={styles.fieldLabel}>CAMPUS LOCATION / ROUTE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Central Print Shop to Hostel B"
              placeholderTextColor={colors.inkFaint}
              value={location}
              onChangeText={setLocation}
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>DETAILS & INSTRUCTIONS</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Provide special instructions or deadline specifics..."
              placeholderTextColor={colors.inkFaint}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title="Publish Campus Gig"
              onPress={handleCreate}
              loading={submitting}
              variant="sun"
              size="lg"
              icon={<Plus size={18} color={colors.ink} />}
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
    backgroundColor: colors.sun,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  catText: {
    ...typography.badge,
    fontSize: 11.5,
    color: colors.inkSoft
  },
  catTextActive: {
    color: colors.ink
  },
  row: {
    flexDirection: "row",
    gap: spacing.md
  },
  input: {
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.ink,
    fontSize: 14,
    marginBottom: spacing.md,
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
