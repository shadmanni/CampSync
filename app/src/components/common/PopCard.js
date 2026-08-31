import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, shadows, borders, radii } from '../../theme/theme';

/**
 * PopCard — White surface card with 1.5px ink border and 4px hard offset shadow.
 * Pass `accent` to override the top-line accent strip colour.
 */
export function PopCard({ children, style, noShadow = false }) {
  return (
    <View
      style={[
        styles.card,
        !noShadow && shadows.hard,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    ...borders.card,
    padding: 20,
  },
});
