import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, borders } from '../../theme/theme';

/**
 * PopHeader — Module-specific header with canvasTint background and 1.5px bottom border.
 * Displays module icon, title, and optional subtitle + right action.
 */
export function PopHeader({ title, subtitle, accent, icon: Icon, right }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.row}>
        <View style={styles.titleRow}>
          {Icon && (
            <View style={[styles.iconWrap, { backgroundColor: accent + '18' }]}>
              <Icon size={20} color={accent} strokeWidth={2.4} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>
        </View>
        {right}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.canvasTint,
    paddingHorizontal: spacing.containerPadding,
    paddingBottom: 14,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.lineStrong,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inkSoft,
    marginTop: 2,
  },
});
