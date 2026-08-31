import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShieldCheck, Bell, Sparkles } from "lucide-react-native";
import { colors, spacing, typography, radii } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export const HeaderBar = ({ title, subtitle, onNotificationPress }) => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Sparkles size={16} color={colors.textInverse} />
          </View>
          <Text style={styles.brandTitle}>{title || "CampusSync"}</Text>
        </View>
        {subtitle ? (
          <Text style={styles.subtitle}>{subtitle}</Text>
        ) : (
          <View style={styles.verifiedRow}>
            <ShieldCheck size={13} color={colors.accentEmerald} />
            <Text style={styles.verifiedText}>
              {user?.department || "Verified Campus Network"}
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
          <Bell size={18} color={colors.primary} />
          <View style={styles.notificationDot} />
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
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2
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
    borderRadius: radii.md,
    backgroundColor: colors.primary, // Deep Indigo
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 21,
    color: colors.primary
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 3
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.accentEmerald,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "700"
  },
  right: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.bgDim,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary // Warm Orange #FF6F3C
  }
});
