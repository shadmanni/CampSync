import React from "react";
import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";

export const PopPill = ({
  label,
  active = false,
  onPress,
  count,
  accentColor = colors.violet,
  accentSoftColor = colors.violetSoft
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.pill,
        active
          ? [styles.pillActive, { backgroundColor: accentColor, borderColor: colors.borderInk }]
          : styles.pillInactive
      ]}
    >
      <Text style={[styles.text, active ? styles.textActive : styles.textInactive]}>
        {label}
      </Text>
      {count !== undefined && (
        <View
          style={[
            styles.countBadge,
            active
              ? { backgroundColor: "rgba(255, 255, 255, 0.25)" }
              : { backgroundColor: colors.line }
          ]}
        >
          <Text style={[styles.countText, active ? styles.textActive : styles.countTextInactive]}>
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.pill,
    marginRight: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5
  },
  pillInactive: {
    backgroundColor: colors.surface,
    borderColor: colors.line
  },
  pillActive: {
    shadowColor: colors.ink,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2
  },
  text: {
    ...typography.badge,
    fontSize: 12.5
  },
  textInactive: {
    color: colors.inkSoft
  },
  textActive: {
    color: colors.surface
  },
  countBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.pill
  },
  countText: {
    fontSize: 10.5,
    fontWeight: "800"
  },
  countTextInactive: {
    color: colors.ink
  }
});
