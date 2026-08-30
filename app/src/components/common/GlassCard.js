import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii, spacing } from "../../theme/theme";

export const GlassCard = ({ children, style, variant = "default" }) => {
  return (
    <View
      style={[
        styles.card,
        variant === "highlight" && styles.cardHighlight,
        variant === "surface" && styles.cardSurface,
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgGlass,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: spacing.md,
    overflow: "hidden"
  },
  cardSurface: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderGlass
  },
  cardHighlight: {
    backgroundColor: colors.bgGlassHighlight,
    borderColor: colors.borderHighlight
  }
});
