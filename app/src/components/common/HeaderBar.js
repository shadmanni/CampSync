import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ShieldCheck, Bell, Sparkles } from "lucide-react-native";
import { colors, spacing, typography } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export const HeaderBar = ({ title, subtitle, onNotificationPress }) => {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.left}>
        <View style={styles.logoRow}>
          <View style={styles.logoBadge}>
            <Sparkles size={16} color={colors.textMain} />
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
          <Bell size={18} color={colors.textMuted} />
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
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass
  },
  left: {
    flex: 1
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3
  },
  brandTitle: {
    ...typography.h2,
    fontSize: 20
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textMuted,
    marginTop: 2
  },
  verifiedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2
  },
  verifiedText: {
    ...typography.bodySm,
    color: colors.accentEmerald,
    marginLeft: 4,
    fontSize: 11,
    fontWeight: "600"
  },
  right: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.bgGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: "center",
    justifyContent: "center"
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.primaryLight
  }
});
