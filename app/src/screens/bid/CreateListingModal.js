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
import { X, Plus, Tag, Sparkles } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { bidService } from "../../services/bidService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";

const BID_CATEGORIES = ["Electronics", "Textbooks", "Hostel Gear", "Cycles", "Fashion"];

export const CreateListingModal = ({ visible, onClose, onCreated }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [type, setType] = useState("AUCTION"); // 'AUCTION' | 'FIXED'
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCreate = async () => {
    setErrorMsg("");
    if (!title.trim()) {
      setErrorMsg("Please enter an item title.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setErrorMsg("Please enter a valid starting price in ₹.");
      return;
    }

    setSubmitting(true);
    try {
      const newItem = await bidService.createItem({
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        startingPrice: numPrice,
        sellerName: user?.name || "Verified Student",
        department: user?.department || "Computer Science"
      });

      setSubmitting(false);
      setTitle("");
      setDescription("");
      setPrice("");
      onCreated(newItem);
      onClose();
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.message || "Failed to create listing.");
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
            <Text style={styles.headerTitle}>List Marketplace Item</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            {/* Listing Type Toggle */}
            <Text style={styles.fieldLabel}>LISTING FORMAT</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, type === "AUCTION" && styles.typeBtnActive]}
                onPress={() => setType("AUCTION")}
              >
                <Text style={[styles.typeText, type === "AUCTION" && styles.typeTextActive]}>
                  ⚡ Live Auction
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, type === "FIXED" && styles.typeBtnActive]}
                onPress={() => setType("FIXED")}
              >
                <Text style={[styles.typeText, type === "FIXED" && styles.typeTextActive]}>
                  🏷️ Fixed Price
                </Text>
              </TouchableOpacity>
            </View>

            {/* Category */}
            <Text style={styles.fieldLabel}>CATEGORY</Text>
            <View style={styles.catGrid}>
              {BID_CATEGORIES.map((cat) => (
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
            <Text style={styles.fieldLabel}>ITEM NAME</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Sony Noise-Canceling Headphones"
              placeholderTextColor={colors.inkFaint}
              value={title}
              onChangeText={setTitle}
            />

            {/* Price */}
            <Text style={styles.fieldLabel}>
              {type === "AUCTION" ? "STARTING BID (₹)" : "SELLING PRICE (₹)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              placeholderTextColor={colors.inkFaint}
              value={price}
              onChangeText={setPrice}
              keyboardType="number-pad"
            />

            {/* Description */}
            <Text style={styles.fieldLabel}>DESCRIPTION & CONDITION</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe condition, pickup location (e.g. Hostel Block C), accessories..."
              placeholderTextColor={colors.inkFaint}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title="Publish Listing"
              onPress={handleCreate}
              loading={submitting}
              variant="coral"
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
    backgroundColor: colors.coral,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  typeText: {
    ...typography.badge,
    color: colors.inkSoft,
    fontSize: 13
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
    backgroundColor: colors.coral,
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
