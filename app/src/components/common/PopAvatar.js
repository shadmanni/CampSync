import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, radii } from "../../theme/theme";

export const PopAvatar = ({ name = "", anonymous = false, size = 38, accentColor = colors.violet }) => {
  const getInitials = (n) => {
    if (!n) return "CS";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: anonymous ? radii.sm : size / 2,
          backgroundColor: anonymous ? colors.surfaceInset : colors.canvasTint,
          borderColor: colors.lineStrong
        }
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: size * 0.38,
            color: anonymous ? colors.inkFaint : accentColor
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
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontWeight: "800",
    letterSpacing: -0.5
  }
});
