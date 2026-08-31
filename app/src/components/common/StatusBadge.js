import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";

export const StatusBadge = ({ label, variant = "emerald", dot = true, style }) => {
  const getColors = () => {
    switch (variant) {
      case "cyan":
        return { bg: "rgba(6, 182, 212, 0.15)", text: colors.accentCyan, dot: colors.accentCyan };
      case "emerald":
        return { bg: "rgba(16, 185, 129, 0.15)", text: colors.accentEmerald, dot: colors.accentEmerald };
      case "amber":
        return { bg: "rgba(245, 158, 11, 0.15)", text: colors.accentAmber, dot: colors.accentAmber };
      case "rose":
        return { bg: "rgba(244, 63, 94, 0.15)", text: colors.accentRose, dot: colors.accentRose };
      case "primary":
      default:
        return { bg: "rgba(99, 102, 241, 0.15)", text: colors.primaryLight, dot: colors.primary };
    }
  };

  const scheme = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: scheme.dot }]} />}
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
    alignSelf: "flex-start"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  text: {
    ...typography.badge,
    fontSize: 10,
    textTransform: "uppercase"
  }
});
