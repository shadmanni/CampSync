import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShieldCheck, Bell, Sparkles } from "lucide-react-native";
import { colors, radii, spacing, typography, shadows } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export const HeaderBar = ({ title, subtitle, accentColor = colors.violet, onNotificationPress }) => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoRow}>
          <View style={[styles.logoBadge, { backgroundColor: accentColor }]}>
            <Text style={styles.logoText}>CS</Text>
          </View>
          <Text style={styles.brandTitle}>{title || "CampusSync"}</Text>
        </View>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.verifiedRow}>
            <ShieldCheck size={13} color={colors.mint} />
            <Text style={styles.verifiedText}>
              {user?.department || "Verified Student Network"}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.right}>
        <TouchableOpacity
          style={styles.iconButton}
          activeOpacity={0.7}
          onPress={onNotificationPress}
        >
          <Bell size={18} color={colors.ink} />
          <View style={[styles.notificationDot, { backgroundColor: accentColor }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.borderInk
  },
  left: {
    flex: 1
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    ...shadows.hardSm
  },
  logoText: {
    color: colors.surface,
    fontWeight: "900",
    fontSize: 14,
    letterSpacing: -0.5
  },
  brandTitle: {
    ...typography.title,
    fontSize: 20
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.inkSoft,
    marginTop: 2
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.mint,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700"
  },
  right: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.surface2,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.hardSm
  },
  notificationDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.surface
  }
});
