import React from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { colors, radii, spacing, typography } from "../../theme/theme";

export const PrimaryButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  style,
  textStyle
}) => {
  const isSecondary = variant === "secondary";
  const isOutline = variant === "outline";
  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isSecondary && styles.buttonSecondary,
        isOutline && styles.buttonOutline,
        isGhost && styles.buttonGhost,
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? colors.primary : colors.textInverse} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              isSecondary && styles.textSecondary,
              (isOutline || isGhost) && styles.textOutline,
              textStyle
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary, // Warm Orange #FF6F3C
    borderRadius: radii.full,
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4
  },
  buttonSecondary: {
    backgroundColor: colors.primary, // Deep Indigo
    shadowColor: colors.primary,
    shadowOpacity: 0.2
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.primary,
    shadowOpacity: 0,
    elevation: 0
  },
  buttonGhost: {
    backgroundColor: "transparent",
    shadowOpacity: 0,
    elevation: 0
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  iconContainer: {
    marginRight: spacing.sm
  },
  text: {
    ...typography.label,
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: "700"
  },
  textSecondary: {
    color: colors.textInverse
  },
  textOutline: {
    color: colors.primary
  }
});
