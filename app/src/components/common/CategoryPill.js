import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";

export const CategoryPill = ({ label, active = false, onPress, count }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[styles.pill, active && styles.pillActive]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{label}</Text>
      {count !== undefined && (
        <Text style={[styles.count, active && styles.countActive]}>{count}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: colors.bgDim,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radii.full,
    marginRight: spacing.sm,
    flexDirection: "row",
    alignItems: "center"
  },
  pillActive: {
    backgroundColor: colors.primary, // Deep Indigo
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3
  },
  text: {
    ...typography.bodySm,
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13
  },
  textActive: {
    color: colors.textInverse,
    fontWeight: "700"
  },
  count: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.primaryLight,
    marginLeft: 6
  },
  countActive: {
    color: colors.textInverse
  }
});
