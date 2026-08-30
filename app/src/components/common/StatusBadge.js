import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, typography } from "../../theme/theme";

export const StatusBadge = ({ label, variant = "violet", dot = false }) => {
  const getColors = () => {
    switch (variant) {
      case "violet": return { bg: colors.violetSoft, text: colors.violet };
      case "coral": return { bg: colors.coralSoft, text: colors.coral };
      case "mint": return { bg: colors.mintSoft, text: colors.mint };
      case "sky": return { bg: colors.skySoft, text: colors.sky };
      case "sun": return { bg: colors.sunSoft, text: colors.ink };
      case "rose": return { bg: colors.roseSoft, text: colors.rose };
      default: return { bg: colors.surfaceInset, text: colors.ink };
    }
  };

  const scheme = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: scheme.bg }]}>
      {dot && <View style={[styles.dot, { backgroundColor: scheme.text }]} />}
      <Text style={[styles.text, { color: scheme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.line
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  text: {
    ...typography.badge,
    fontSize: 11
  }
});
