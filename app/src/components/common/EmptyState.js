import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { PopCard } from "./PopCard";
import { PopButton } from "./PopButton";

export const EmptyState = ({
  icon,
  title,
  description,
  actionTitle,
  onAction,
  accentColor = colors.violet,
  accentVariant = "violet"
}) => {
  return (
    <PopCard style={styles.card} variant="inset">
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionTitle && onAction && (
        <PopButton
          title={actionTitle}
          onPress={onAction}
          variant={accentVariant}
          size="sm"
          style={styles.actionBtn}
        />
      )}
    </PopCard>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    marginVertical: spacing.lg
  },
  iconContainer: {
    marginBottom: spacing.md,
    opacity: 0.85
  },
  title: {
    ...typography.heading,
    textAlign: "center",
    marginBottom: spacing.xs
  },
  description: {
    ...typography.body,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md
  },
  actionBtn: {
    marginTop: spacing.xs
  }
});
