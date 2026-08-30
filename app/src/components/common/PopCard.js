import React from "react";
import { View, StyleSheet } from "react-native";
import { colors, radii, shadows } from "../../theme/theme";

export const PopCard = ({ children, style, variant = "default", accentColor }) => {
  return (
    <View
      style={[
        styles.card,
        variant === "inset" && styles.cardInset,
        accentColor && { borderColor: colors.lineStrong },
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
    borderColor: colors.lineStrong,
    ...shadows.hard,
    padding: 16
  },
  cardInset: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.line,
    shadowOpacity: 0,
    elevation: 0
  }
});
