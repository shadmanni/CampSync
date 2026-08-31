import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, moduleColors } from '../../theme/theme';

/**
 * PopAvatar — Initials avatar with colour ring.
 * Colour is derived from a simple name-hash (same algorithm as the website's avatarToken).
 */

const AVATAR_TOKENS = [
  moduleColors.violet,
  moduleColors.coral,
  moduleColors.mint,
  moduleColors.sky,
  moduleColors.sun,
  moduleColors.rose,
];

function hashName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function PopAvatar({ name = '', anonymous = false, size = 38 }) {
  const token = anonymous
    ? colors.inkFaint
    : AVATAR_TOKENS[hashName(name) % AVATAR_TOKENS.length];

  const bgOpacity = '28'; // ~16% opacity hex
  const borderOpacity = '60'; // ~38% opacity hex

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: anonymous ? size * 0.32 : size / 2,
          backgroundColor: token + bgOpacity,
          borderColor: token + borderOpacity,
        },
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            color: token,
            fontSize: size * 0.36,
          },
        ]}
      >
        {anonymous ? '??' : getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  initials: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
