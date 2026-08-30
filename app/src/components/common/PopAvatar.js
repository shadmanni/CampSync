import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii, typography } from "../../theme/theme";

const AVATAR_PALETTE = [
  { text: colors.violet, bg: colors.violetSoft },
  { text: colors.coral, bg: colors.coralSoft },
  { text: colors.mint, bg: colors.mintSoft },
  { text: colors.sky, bg: colors.skySoft },
  { text: colors.rose, bg: colors.roseSoft },
  { text: colors.sun, bg: colors.sunSoft }
];

export const PopAvatar = ({ name = "", anonymous = false, size = 38 }) => {
  const getInitials = (n) => {
    if (!n) return "CS";
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  const getColor = (n) => {
    if (anonymous) return { text: colors.inkFaint, bg: colors.surfaceInset };
    let hash = 0;
    for (let i = 0; i < n.length; i++) hash = n.charCodeAt(i) + ((hash << 5) - hash);
    const idx = Math.abs(hash) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[idx];
  };

  const colorScheme = getColor(name);

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: anonymous ? radii.sm : size / 2,
          backgroundColor: colorScheme.bg,
          borderColor: colorScheme.text
        }
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colorScheme.text,
            fontSize: size * 0.36
          }
        ]}
      >
        {anonymous ? "??" : getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5
  },
  text: {
    ...typography.badge,
    fontWeight: "800"
  }
});
