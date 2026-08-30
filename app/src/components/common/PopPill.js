import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, radii, shadows, typography } from "../../theme/theme";

export const PopPill = ({
  label,
  active = false,
  onPress,
  accentColor = colors.violet,
  accentSoft = colors.violetSoft,
  count
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.pill,
        active && {
          backgroundColor: accentColor,
          borderColor: colors.lineStrong,
          ...shadows.hardSm
        },
        !active && {
          backgroundColor: colors.surface,
          borderColor: colors.line
        }
      ]}
    >
      <Text
        style={[
          styles.text,
          active ? { color: "#FFFFFF", fontWeight: "800" } : { color: colors.inkSoft }
        ]}
      >
        {label}
      </Text>
      {count !== undefined && (
        <Text
          style={[
            styles.count,
            active ? { color: "#FFFFFF" } : { color: colors.inkFaint }
          ]}
        >
          {count}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: radii.full,
    borderWidth: 1.5,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center"
  },
  text: {
    ...typography.bodySm,
    fontSize: 13,
    fontWeight: "600"
  },
  count: {
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6
  }
});
