import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

export const EmptyState = ({
  icon,
  title = "No Content Yet",
  description = "There are no items found in this section. Be the first to start the conversation!",
  actionTitle,
  onAction
}) => {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onAction && (
        <PrimaryButton
          title={actionTitle}
          onPress={onAction}
          style={styles.actionButton}
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
    backgroundColor: colors.bgGlass,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginHorizontal: spacing.containerPadding,
    marginVertical: spacing.lg
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(99, 102, 241, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    ...typography.h3,
    textAlign: "center",
    marginBottom: spacing.sm
  },
  description: {
    ...typography.body,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: spacing.lg
  },
  actionButton: {
    minWidth: 160
  }
});
