import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

export const ErrorState = ({
  icon,
  title = "Something went wrong",
  message = "Failed to load content. Please check your network connection and try again.",
  onRetry
}) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PrimaryButton
          title="Try Again"
          onPress={onRetry}
          variant="outline"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    backgroundColor: "rgba(244, 63, 94, 0.08)",
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.25)",
    marginHorizontal: spacing.containerPadding,
    marginVertical: spacing.lg
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(244, 63, 94, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    ...typography.h3,
    color: colors.accentRose,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  message: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg
  },
  retryButton: {
    minWidth: 140,
    borderColor: colors.accentRose
  }
});
