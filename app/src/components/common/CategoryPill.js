import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";

export const CategoryPill = ({ label, active = false, onPress, count }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
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
    backgroundColor: colors.bgGlass,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginRight: spacing.sm,
    flexDirection: "row",
    alignItems: "center"
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.borderHighlight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 3
  },
  text: {
    ...typography.bodySm,
    color: colors.textMuted,
    fontWeight: "500"
  },
  textActive: {
    color: colors.textMain,
    fontWeight: "700"
  },
  count: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.textSubtle,
    marginLeft: 6
  },
  countActive: {
    color: colors.textMain
  }
});
