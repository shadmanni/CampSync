import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, radii, borders } from '../../theme/theme';

/**
 * SkeletonLoader — Placeholder shimmer styled with Campus Pop tokens.
 * Shows a card outline with pulsing bars inside.
 */
export function SkeletonCard({ lines = 3, height = 168 }) {
  return (
    <View style={[styles.card, { minHeight: height }]}>
      <View style={styles.headerRow}>
        <View style={[styles.skel, styles.circle]} />
        <View style={{ flex: 1 }}>
          <View style={[styles.skel, { width: '38%', height: 11, marginBottom: 7 }]} />
          <View style={[styles.skel, { width: '22%', height: 9 }]} />
        </View>
      </View>
      {Array.from({ length: lines }, (_, i) => (
        <View
          key={i}
          style={[
            styles.skel,
            {
              height: 11,
              marginBottom: 9,
              width: i === lines - 1 ? '62%' : '100%',
            },
          ]}
        />
      ))}
    </View>
  );
}

export function SkeletonGrid({ count = 4, lines, height }) {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} lines={lines} height={height} />
      ))}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  circle: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  skel: {
    backgroundColor: colors.surfaceInset,
    borderRadius: 6,
  },
  grid: {
    gap: 16,
  },
});
