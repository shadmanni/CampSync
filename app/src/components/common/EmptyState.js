import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radii, spacing } from '../../theme/theme';

/**
 * EmptyState — Centered hint when a feed is empty.
 * Styled with Campus Pop warm tokens.
 */
export function EmptyState({ icon: Icon, title, hint, action }) {
  return (
    <View style={styles.container}>
      {Icon && (
        <Icon size={30} color={colors.inkFaint} strokeWidth={1.6} />
      )}
      <View style={{ alignItems: 'center' }}>
        <Text style={styles.title}>{title}</Text>
        {hint && <Text style={styles.hint}>{hint}</Text>}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: spacing.containerPadding,
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.ink,
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 4,
  },
});
