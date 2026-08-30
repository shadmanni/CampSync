import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { colors, radii, shadows, spacing, typography } from "../../theme/theme";

export const PopButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "violet", // 'violet' | 'coral' | 'mint' | 'sky' | 'sun' | 'rose' | 'ink' | 'surface' | 'ghost'
  size = "md", // 'sm' | 'md' | 'lg'
  icon,
  style,
  textStyle
}) => {
  const [pressed, setPressed] = useState(false);

  const getBgColor = () => {
    switch (variant) {
      case "violet": return colors.violet;
      case "coral": return colors.coral;
      case "mint": return colors.mint;
      case "sky": return colors.sky;
      case "sun": return colors.sun;
      case "rose": return colors.rose;
      case "ink": return colors.ink;
      case "surface": return colors.surface;
      case "ghost": return "transparent";
      default: return colors.violet;
    }
  };

  const getTextColor = () => {
    if (variant === "surface" || variant === "ghost") return colors.ink;
    if (variant === "sun") return colors.ink; // Sun is yellow, needs dark text
    return colors.surface; // White text for violet, coral, mint, sky, rose, ink
  };

  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBgColor() },
        isGhost ? styles.buttonGhost : styles.buttonPop,
        size === "sm" && styles.buttonSm,
        size === "lg" && styles.buttonLg,
        pressed && !isGhost && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          {title ? (
            <Text
              style={[
                styles.text,
                { color: getTextColor() },
                size === "sm" && styles.textSm,
                size === "lg" && styles.textLg,
                textStyle
              ]}
            >
              {title}
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: spacing.lg
  },
  buttonPop: {
    borderWidth: 1.5,
    borderColor: colors.borderInk,
    ...shadows.hardSm
  },
  buttonGhost: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm
  },
  buttonLg: {
    paddingVertical: 15,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg
  },
  buttonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 0, height: 0 },
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
  iconWrapper: {
    marginRight: 6
  },
  text: {
    ...typography.badge,
    fontSize: 14
  },
  textSm: {
    fontSize: 12
  },
  textLg: {
    fontSize: 16
  }
});
