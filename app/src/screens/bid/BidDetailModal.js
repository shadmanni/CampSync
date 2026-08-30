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
import { X, Gavel, TrendingUp, Clock, User, ShieldCheck } from "lucide-react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";
import { bidService } from "../../services/bidService";
import { useAuth } from "../../context/AuthContext";
import { PopButton } from "../../components/common/PopButton";
import { PopCard } from "../../components/common/PopCard";
import { PopAvatar } from "../../components/common/PopAvatar";

export const BidDetailModal = ({ visible, item, onClose, onBidSuccess }) => {
  const { user } = useAuth();
  if (!item) return null;

  const minBid = (item.currentBid || item.startingPrice || 100) + 50;
  const [bidAmount, setBidAmount] = useState(String(minBid));
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePlaceBid = async () => {
    setErrorMsg("");
    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= (item.currentBid || item.startingPrice || 0)) {
      setErrorMsg(`Bid must be strictly higher than current price of ₹${item.currentBid || item.startingPrice}.`);
      return;
    }

    setLoading(true);
    try {
      const updated = await bidService.placeBid(item.id, amount, user?.name || "Verified Student");
      setLoading(false);
      onBidSuccess(updated);
      onClose();
    } catch (err) {
      setLoading(false);
      setErrorMsg(err.message || "Failed to place bid.");
    }
  };

  const addQuick = (increment) => {
    const curr = Number(bidAmount) || minBid;
    setBidAmount(String(curr + increment));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.badgeLabel}>
                {item.type === "AUCTION" ? "⚡ LIVE AUCTION" : "🏷️ SECOND-HAND MARKET"}
              </Text>
              <Text style={styles.headerTitle}>{item.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">
            <PopCard style={styles.priceCard} variant="inset">
              <View style={styles.priceRow}>
                <View>
                  <Text style={styles.priceLabel}>CURRENT HIGHEST BID</Text>
                  <Text style={styles.priceValue}>₹{(item.currentBid || item.startingPrice || 0).toLocaleString()}</Text>
                </View>
                <View style={styles.bidsBadge}>
                  <TrendingUp size={13} color={colors.coral} />
                  <Text style={styles.bidsBadgeText}>{item.bidsCount || 0} bids placed</Text>
                </View>
              </View>

              {item.highestBidder ? (
                <Text style={styles.bidderText}>
                  Leading: <Text style={{ fontWeight: "800", color: colors.ink }}>{item.highestBidder}</Text>
                </Text>
              ) : (
                <Text style={styles.bidderText}>No bids yet — be the first!</Text>
              )}
            </PopCard>

            <Text style={styles.descTitle}>DESCRIPTION</Text>
            <Text style={styles.descText}>{item.description || "Well maintained student item available for pickup at campus."}</Text>

            <Text style={styles.descTitle}>SELLER</Text>
            <View style={styles.sellerRow}>
              <PopAvatar name={item.sellerName || "Student"} size={36} />
              <View style={{ marginLeft: spacing.sm }}>
                <Text style={styles.sellerName}>{item.sellerName || "Verified Student"}</Text>
                <Text style={styles.sellerDept}>{item.department || "Hostel Block A"}</Text>
              </View>
            </View>

            {/* Quick Increment Chips */}
            <Text style={styles.descTitle}>CHOOSE BID AMOUNT (₹)</Text>
            <View style={styles.quickRow}>
              {[50, 100, 200, 500].map((inc) => (
                <TouchableOpacity
                  key={inc}
                  style={styles.quickChip}
                  onPress={() => addQuick(inc)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.quickText}>+{inc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Bid Input */}
            <TextInput
              style={styles.bidInput}
              value={bidAmount}
              onChangeText={setBidAmount}
              keyboardType="number-pad"
              placeholder="Enter amount"
              placeholderTextColor={colors.inkFaint}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <PopButton
              title={`Submit Bid of ₹${Number(bidAmount || 0).toLocaleString()}`}
              onPress={handlePlaceBid}
              loading={loading}
              variant="coral"
              size="lg"
              icon={<Gavel size={18} color={colors.surface} />}
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
    maxHeight: "90%"
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.line
  },
  badgeLabel: {
    ...typography.badge,
    color: colors.coral,
    fontSize: 11,
    marginBottom: 4
  },
  headerTitle: {
    ...typography.title,
    fontSize: 18,
    maxWidth: 260
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
  priceCard: {
    padding: spacing.md,
    marginBottom: spacing.md
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs
  },
  priceLabel: {
    ...typography.caption,
    color: colors.inkFaint,
    fontSize: 10
  },
  priceValue: {
    ...typography.hero,
    fontSize: 26,
    color: colors.coral
  },
  bidsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.coralSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.pill,
    ...shadows.hardSm
  },
  bidsBadgeText: {
    ...typography.badge,
    color: colors.coral,
    fontSize: 11
  },
  bidderText: {
    ...typography.bodySm,
    color: colors.inkSoft,
    marginTop: 4
  },
  descTitle: {
    ...typography.caption,
    color: colors.ink,
    fontSize: 11,
    marginTop: spacing.md,
    marginBottom: 6
  },
  descText: {
    ...typography.body,
    lineHeight: 20
  },
  sellerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  sellerName: {
    ...typography.badge,
    fontSize: 13,
    color: colors.ink
  },
  sellerDept: {
    ...typography.bodySm,
    fontSize: 11
  },
  quickRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  quickChip: {
    flex: 1,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingVertical: 8,
    borderRadius: radii.md,
    alignItems: "center",
    ...shadows.hardSm
  },
  quickText: {
    ...typography.badge,
    fontSize: 12,
    color: colors.ink
  },
  bidInput: {
    backgroundColor: colors.surface2,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    color: colors.ink,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: spacing.md,
    ...shadows.hardSm
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
