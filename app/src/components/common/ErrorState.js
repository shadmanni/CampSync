import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { colors, spacing } from '../../theme/theme';
import { PopButton } from './PopButton';

/**
 * ErrorState — Friendly error display with retry.
 * Uses warm Campus Pop tokens.
 */
export function ErrorState({ message = 'Something went wrong', onRetry }) {
  return (
    <View style={styles.container}>
      <AlertTriangle size={28} color={colors.rose} strokeWidth={1.8} />
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <PopButton
          title="Try again"
          accent={colors.violet}
          variant="outline"
          size="sm"
          onPress={onRetry}
        />
      )}
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
  message: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ink,
    textAlign: 'center',
  },
});
