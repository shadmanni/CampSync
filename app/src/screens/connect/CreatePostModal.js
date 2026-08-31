import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { X, Send, Shield, Sparkles } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../context/AuthContext";
import { PrimaryButton } from "../../components/common/PrimaryButton";

const CATEGORIES = ["Academic", "General", "Lost & Found"];

export const CreatePostModal = ({ visible, onClose, onCreated }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Academic");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("Please enter a discussion title.");
      return;
    }
    if (!content.trim()) {
      setErrorMsg("Please enter the discussion details.");
      return;
    }

    setSubmitting(true);
    try {
      const newPost = await connectService.createPost({
        title: title.trim(),
        content: content.trim(),
        category,
        isAnonymous,
        authorName: user?.name || "Verified Student"
      });

      setSubmitting(false);
      setTitle("");
      setContent("");
      setIsAnonymous(false);
      onCreated(newPost);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "Failed to publish post.");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Discussion</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSubtle} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            {/* Category Selector */}
            <Text style={styles.fieldLabel}>SELECT CATEGORY</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catPill,
                    category === cat && styles.catPillActive
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.catText,
                      category === cat && styles.catTextActive
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Title Input */}
            <Text style={styles.fieldLabel}>TITLE</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Study group for finals?"
              placeholderTextColor={colors.textSubtle}
              value={title}
              onChangeText={setTitle}
            />

            {/* Content Input */}
            <Text style={styles.fieldLabel}>DETAILS</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Share background, question specifics, or venue notes..."
              placeholderTextColor={colors.textSubtle}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Anonymous Toggle */}
            <View style={styles.anonToggleRow}>
              <View style={styles.anonLeft}>
                <Shield size={20} color={isAnonymous ? colors.secondary : colors.textSubtle} />
                <View style={styles.anonMeta}>
                  <Text style={styles.anonTitle}>Post Anonymously</Text>
                  <Text style={styles.anonSubtitle}>
                    Hide your name while keeping university verification
                  </Text>
                </View>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: colors.bgSubtle, true: colors.secondary }}
                thumbColor={colors.bgSurface}
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            {/* Submit Button */}
            <PrimaryButton
              title="Publish to Campus"
              onPress={handleCreate}
              loading={submitting}
              icon={<Send size={18} color={colors.textInverse} />}
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
    backgroundColor: "rgba(24, 0, 82, 0.45)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: colors.bgSurface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingBottom: spacing.xl,
    maxHeight: "88%",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass
  },
  headerTitle: {
    ...typography.h3,
    color: colors.primary,
    fontSize: 18
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center"
  },
  formScroll: {
    padding: spacing.containerPadding
  },
  fieldLabel: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    fontSize: 11
  },
  categoryRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.lg
  },
  catPill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
    backgroundColor: colors.bgDim
  },
  catPillActive: {
    backgroundColor: colors.primary
  },
  catText: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "600"
  },
  catTextActive: {
    color: colors.textInverse,
    fontWeight: "700"
  },
  titleInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    ...typography.bodyLg,
    fontSize: 15,
    marginBottom: spacing.lg
  },
  contentInput: {
    backgroundColor: colors.bgSubtle,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.textPrimary,
    ...typography.body,
    fontSize: 14,
    minHeight: 100,
    marginBottom: spacing.lg
  },
  anonToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bgDim,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.lg
  },
  anonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: spacing.sm
  },
  anonMeta: {
    marginLeft: spacing.sm,
    flex: 1
  },
  anonTitle: {
    ...typography.label,
    fontSize: 14,
    color: colors.primary
  },
  anonSubtitle: {
    ...typography.bodySm,
    color: colors.textSubtle,
    fontSize: 11
  },
  errorText: {
    ...typography.bodySm,
    color: colors.accentRose,
    marginBottom: spacing.md,
    fontWeight: "600"
  },
  submitBtn: {
    marginBottom: spacing.xl
  }
});
