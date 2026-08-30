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
import { X, Send, Shield } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { connectService } from "../../services/connectService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";
import { PopPill } from "../../components/common/PopPill";

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
      setErrorMsg(err.message || "Failed to publish discussion.");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>New Discussion</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} keyboardShouldPersistTaps="handled">
            {/* Category Pills */}
            <Text style={styles.label}>CATEGORY</Text>
            <View style={styles.pillsRow}>
              {CATEGORIES.map((cat) => (
                <PopPill
                  key={cat}
                  label={cat}
                  active={category === cat}
                  accentColor={colors.violet}
                  accentSoft={colors.violetSoft}
                  onPress={() => setCategory(cat)}
                />
              ))}
            </View>

            {/* Title */}
            <Text style={styles.label}>TITLE</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Study group for Algorithms final exam?"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
            />

            {/* Details */}
            <Text style={styles.label}>DETAILS</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              placeholder="Share context, question specifics, or venue..."
              placeholderTextColor={colors.inkFaint}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Anonymous Mode */}
            <View style={styles.anonRow}>
              <View style={styles.anonLeft}>
                <Shield size={18} color={isAnonymous ? colors.violet : colors.inkFaint} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.anonTitle}>Post Anonymously</Text>
                  <Text style={styles.anonSubtitle}>Hide name while keeping student verification</Text>
                </View>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: colors.surfaceInset, true: colors.violet }}
                thumbColor={colors.surface}
              />
            </View>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title="Publish Discussion"
              onPress={handleCreate}
              loading={submitting}
              variant="violet"
              size="lg"
              icon={<Send size={16} color="#FFFFFF" />}
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
    backgroundColor: "rgba(23, 21, 15, 0.45)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderColor: colors.lineStrong,
    maxHeight: "88%",
    paddingBottom: spacing.xl,
    ...shadows.hardLg
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: radii.full,
    backgroundColor: colors.canvas,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  scrollBody: {
    padding: 20
  },
  label: {
    ...typography.label,
    fontSize: 11,
    color: colors.inkFaint,
    letterSpacing: 0.5,
    marginBottom: 8
  },
  pillsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
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
  },
  textarea: {
    minHeight: 100
  },
  anonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.canvasTint,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    padding: 12,
    marginBottom: 16
  },
  anonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  anonTitle: {
    ...typography.label,
    fontSize: 14
  },
  anonSubtitle: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 11
  },
  errorText: {
    ...typography.bodySm,
    color: colors.danger,
    fontWeight: "700",
    marginBottom: 12
  },
  submitBtn: {
    marginBottom: 24
  }
});
