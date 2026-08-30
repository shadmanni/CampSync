import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShieldCheck, User } from "lucide-react-native";
import { colors, radii, shadows, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export const PopHeader = ({ title, subtitle, accentColor = colors.violet, onProfilePress }) => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, { backgroundColor: colors.ink }]}>
            <Text style={styles.brandBadgeText}>CS</Text>
          </View>
          <View>
            <Text style={styles.title}>{title || "CampusSync"}</Text>
            {subtitle ? (
              <Text style={styles.subtitle}>{subtitle}</Text>
            ) : (
              <View style={styles.verifiedRow}>
                <ShieldCheck size={13} color={colors.mint} />
                <Text style={styles.verifiedText}>Verified Campus Network</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.profileBtn}
        onPress={onProfilePress}
        activeOpacity={0.8}
      >
        <User size={16} color={colors.ink} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: colors.canvas,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong
  },
  left: {
    flex: 1
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  brandBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    ...shadows.hardSm
  },
  brandBadgeText: {
    color: colors.inkInvert,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: -0.5
  },
  title: {
    ...typography.h3,
    fontSize: 17,
    color: colors.ink
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.inkFaint,
    fontSize: 11
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.mint,
    fontSize: 11,
    fontWeight: "700"
  },
  profileBtn: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  }
});
