import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, borders, radii } from '../../theme/theme';

/**
 * PopPill — Filter pill with 1.5px ink border.
 * Active = accent fill. Inactive = surfaceInset background.
 */
export function PopPill({ label, active = false, onPress, accent = colors.violet }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        active
          ? { backgroundColor: accent, borderColor: colors.lineStrong }
          : { backgroundColor: colors.surfaceInset, borderColor: colors.line },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.onAccent : colors.inkSoft },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    borderWidth: 1.5,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
