import React, { useState } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { colors, radii, shadows, typography } from "../../theme/theme";

export const PopButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "violet", // "violet" | "coral" | "mint" | "sky" | "sun" | "rose" | "ink" | "surface" | "ghost"
  size = "md", // "sm" | "md" | "lg"
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
    if (variant === "surface") return colors.ink;
    if (variant === "ghost") return colors.ink;
    if (variant === "sun") return colors.ink;
    return "#FFFFFF";
  };

  const isGhost = variant === "ghost";

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        { backgroundColor: getBgColor() },
        isGhost && styles.buttonGhost,
        size === "sm" && styles.buttonSm,
        size === "lg" && styles.buttonLg,
        !isGhost && (pressed ? styles.buttonPressed : shadows.hardSm),
        disabled && styles.buttonDisabled,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            style={[
              styles.text,
              { color: getTextColor() },
              size === "sm" && { fontSize: 13 },
              size === "lg" && { fontSize: 16 },
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
    borderRadius: radii.full,
    borderWidth: 1.5,
    borderColor: colors.lineStrong,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  buttonSm: {
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  buttonLg: {
    paddingVertical: 16,
    paddingHorizontal: 26
  },
  buttonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 0,
    elevation: 0
  },
  buttonGhost: {
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0
  },
  buttonDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  },
  iconContainer: {
    marginRight: 6
  },
  text: {
    ...typography.label,
    fontSize: 14,
    fontWeight: "800"
  }
});
