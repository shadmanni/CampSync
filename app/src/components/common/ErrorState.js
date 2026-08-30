import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AlertCircle, RotateCcw } from "lucide-react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";
import { PopCard } from "./PopCard";
import { PopButton } from "./PopButton";

export const ErrorState = ({ title = "Something went wrong", message, onRetry }) => {
  return (
    <PopCard style={styles.card} variant="inset">
      <View style={styles.iconCircle}>
        <AlertCircle size={24} color={colors.rose} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {onRetry && (
        <PopButton
          title="Try Again"
          onPress={onRetry}
          variant="surface"
          size="sm"
          icon={<RotateCcw size={14} color={colors.ink} />}
          style={styles.retryBtn}
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
    marginVertical: spacing.lg,
    borderColor: colors.roseSoft
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.roseSoft,
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    ...typography.heading,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 4
  },
  message: {
    ...typography.body,
    color: colors.inkSoft,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md
  },
  retryBtn: {
    marginTop: spacing.xs
  }
});
