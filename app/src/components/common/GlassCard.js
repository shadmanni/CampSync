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
    backgroundColor: colors.bgSurface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3
  },
  cardSurface: {
    backgroundColor: colors.bgSubtle,
    borderColor: colors.borderSubtle
  },
  cardHighlight: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderHighlight,
    shadowOpacity: 0.08,
    shadowRadius: 20
  }
});
