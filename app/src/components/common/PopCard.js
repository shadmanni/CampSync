import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii, shadows, spacing } from "../../theme/theme";

export const PopCard = ({ children, style, variant = "default", accentColor }) => {
  const isInset = variant === "inset";
  const isFlat = variant === "flat";

  return (
    <View
      style={[
        styles.card,
        isInset && styles.cardInset,
        isFlat && styles.cardFlat,
        accentColor && { borderColor: colors.ink },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    padding: spacing.md,
    ...shadows.hard
  },
  cardInset: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1.5,
    borderColor: colors.line,
    shadowOpacity: 0,
    elevation: 0
  },
  cardFlat: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    shadowOpacity: 0,
    elevation: 0
  }
});
