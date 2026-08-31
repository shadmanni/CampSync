import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../../theme/theme';

/**
 * SeatPips — Segmented meter for ride seats.
 * Taken pips = faint ink (dimmed). Free pips = module accent (vivid).
 * Matches website's SeatPips component exactly.
 */
export function SeatPips({ total, available, accent = colors.mint }) {
  const taken = Math.max(0, total - available);

  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={[
            styles.pip,
            i < taken
              ? { backgroundColor: colors.inkFaint, opacity: 0.35 }
              : { backgroundColor: accent, opacity: 1 },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pip: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
});
